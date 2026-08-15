from __future__ import annotations

import json
import os
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import suppress
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.auth import ServiceAuth
from app.config import Settings
from app.database import SupabaseRestRpc
from app.evidence.engine import evaluate_evidence
from app.evidence.models import MeasurementRecordInput
from app.evidence.writer import EvidenceWriter
from app.processing.measurement_writer import MeasurementWriter
from app.processing.worker import PromptAudioInput, ScanWorker
from app.storage.supabase import SupabasePrivateAudioStorage, SupabaseStorageError

from ..support import PROMPT_IDS, fixture_path

REQUIRED_ENV = (
    "SOULSCOPE_RUN_HOSTED_TESTS",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SOULSCOPE_SUPABASE_STORAGE_BUCKET",
    "SOULSCOPE_STAGING_USER_A_EMAIL",
    "SOULSCOPE_STAGING_USER_A_PASSWORD",
    "SOULSCOPE_STAGING_USER_B_EMAIL",
    "SOULSCOPE_STAGING_USER_B_PASSWORD",
)


def _hosted_enabled() -> bool:
    return os.environ.get("SOULSCOPE_RUN_HOSTED_TESTS") == "1" and all(
        os.environ.get(name) for name in REQUIRED_ENV if name != "SOULSCOPE_RUN_HOSTED_TESTS"
    )


HOSTED_SKIP_REASON = (
    "Hosted Supabase tests require SOULSCOPE_RUN_HOSTED_TESTS=1 plus staging Supabase URL, "
    "anon key, service-role key, private bucket, and two test-user credentials."
)


@dataclass(frozen=True)
class Session:
    user_id: str
    access_token: str


class HostedHttpError(RuntimeError):
    def __init__(self, method: str, route: str, status_code: int, detail: str) -> None:
        self.status_code = status_code
        super().__init__(f"{method} {route} failed with {status_code}: {_safe_detail(detail)}")


@unittest.skipUnless(_hosted_enabled(), HOSTED_SKIP_REASON)
class HostedMeasurementPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.supabase_url = os.environ["SUPABASE_URL"].rstrip("/")
        self.anon_key = os.environ["SUPABASE_ANON_KEY"]
        self.service_role_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        self.bucket = os.environ["SOULSCOPE_SUPABASE_STORAGE_BUCKET"]
        self.namespace = f"hosted-{datetime.now(UTC).strftime('%Y%m%d%H%M%S%f')}"
        self.user_a = self._password_session(
            os.environ["SOULSCOPE_STAGING_USER_A_EMAIL"],
            os.environ["SOULSCOPE_STAGING_USER_A_PASSWORD"],
        )
        self.user_b = self._password_session(
            os.environ["SOULSCOPE_STAGING_USER_B_EMAIL"],
            os.environ["SOULSCOPE_STAGING_USER_B_PASSWORD"],
        )
        self.settings = Settings(
            supabase_url=self.supabase_url,
            supabase_service_role_key=self.service_role_key,
            private_audio_root=Path("/tmp") / f"soulscope-hosted-{self.namespace}",
            storage_backend="supabase",
            private_audio_bucket=self.bucket,
        )
        self.storage = SupabasePrivateAudioStorage(self.settings, ServiceAuth(self.service_role_key))
        self.storage.ensure_private_bucket()
        self.created_object_paths: list[str] = []
        self.created_scan_ids: list[str] = []

    def tearDown(self) -> None:
        for object_path in self.created_object_paths:
            with suppress(SupabaseStorageError, ValueError):
                self.storage.delete(object_path)
        for scan_id in self.created_scan_ids:
            with suppress(HostedHttpError):
                self._rpc_as_user(
                    self.user_a,
                    "transition_scan_lifecycle",
                    {
                        "requested_scan_id": scan_id,
                        "requested_next_state": "deleted",
                        "transition_details": {"testNamespace": self.namespace},
                    },
                )

    def test_privileged_rpcs_are_service_only(self) -> None:
        with self.assertRaises(HostedHttpError) as anon_error:
            self._rpc_with_key(
                self.anon_key,
                None,
                "start_scan_processing_run",
                {
                    "p_scan_id": "00000000-0000-4000-8000-000000000000",
                    "p_idempotency_key": f"{self.namespace}:anon-denied",
                    "p_extractor_version": "test",
                },
            )
        self.assertIn(anon_error.exception.status_code, (401, 403, 404))

        with self.assertRaises(HostedHttpError) as anon_evidence_error:
            self._rpc_with_key(
                self.anon_key,
                None,
                "create_evidence_ledger",
                {
                    "p_measurement_record_id": "00000000-0000-4000-8000-000000000000",
                    "p_idempotency_key": f"{self.namespace}:anon-evidence-denied",
                    "p_evidence_engine_version": "soulscope-evidence-engine-0.1.0",
                    "p_evidence_rule_version": "evidence-structural-v1",
                    "p_evidence_registry_version": "0.1",
                    "p_ledger_schema_version": "0.1",
                    "p_entries": [{"evidence_id": "ev_denied"}],
                    "p_status_counts": {
                        "supported": 0,
                        "contradicted": 0,
                        "unavailable": 1,
                        "rejected": 0,
                        "insufficient": 0,
                    },
                    "p_provenance": {"raw_audio_consumed": False, "acoustic_extraction_rerun": False},
                },
            )
        self.assertIn(anon_evidence_error.exception.status_code, (401, 403, 404))

        with self.assertRaises(HostedHttpError) as user_error:
            self._rpc_as_user(
                self.user_a,
                "start_scan_processing_run",
                {
                    "p_scan_id": "00000000-0000-4000-8000-000000000000",
                    "p_idempotency_key": f"{self.namespace}:user-denied",
                    "p_extractor_version": "test",
                },
            )
        self.assertIn(user_error.exception.status_code, (401, 403, 404))

        with self.assertRaises(HostedHttpError) as user_evidence_error:
            self._rpc_as_user(
                self.user_a,
                "create_evidence_ledger",
                {
                    "p_measurement_record_id": "00000000-0000-4000-8000-000000000000",
                    "p_idempotency_key": f"{self.namespace}:user-evidence-denied",
                    "p_evidence_engine_version": "soulscope-evidence-engine-0.1.0",
                    "p_evidence_rule_version": "evidence-structural-v1",
                    "p_evidence_registry_version": "0.1",
                    "p_ledger_schema_version": "0.1",
                    "p_entries": [{"evidence_id": "ev_denied"}],
                    "p_status_counts": {
                        "supported": 0,
                        "contradicted": 0,
                        "unavailable": 1,
                        "rejected": 0,
                        "insufficient": 0,
                    },
                    "p_provenance": {"raw_audio_consumed": False, "acoustic_extraction_rerun": False},
                },
            )
        self.assertIn(user_evidence_error.exception.status_code, (401, 403, 404))

    def test_hosted_fixture_scan_persists_measurements_and_enforces_rls(self) -> None:
        scan_id, captures = self._create_ready_scan(self.user_a)
        worker = ScanWorker(
            self.settings,
            MeasurementWriter(SupabaseRestRpc(self.supabase_url, ServiceAuth(self.service_role_key))),
            self.storage,
        )

        result = worker.process_scan(
            scan_id,
            [
                PromptAudioInput(prompt_id, capture_id, fixture_path(f"{prompt_id}.wav"))
                for prompt_id, capture_id in captures.items()
            ],
        )
        self.created_object_paths.extend(
            f"{scan_id}/{prompt_id}_{capture_id}.wav" for prompt_id, capture_id in captures.items()
        )

        self.assertEqual(result.semantic_status, "unresolved_abstained")

        owner_measurements = self._rest_as_user(
            self.user_a,
            "GET",
            f"measurement_records?{urlencode({'id': f'eq.{result.measurement_record_id}', 'select': 'id,measurement_status,extractor_version,prompt_measurements'})}",
        )
        self.assertEqual(len(owner_measurements), 1)
        self.assertEqual(owner_measurements[0]["measurement_status"], "qualified")
        self.assertEqual(len(owner_measurements[0]["prompt_measurements"]), 3)

        service_measurements = self._rest_with_key(
            self.service_role_key,
            "GET",
            f"measurement_records?{urlencode({'id': f'eq.{result.measurement_record_id}', 'select': '*'})}",
        )
        ledger = evaluate_evidence(MeasurementRecordInput.from_row(service_measurements[0]))
        evidence_writer = EvidenceWriter(SupabaseRestRpc(self.supabase_url, ServiceAuth(self.service_role_key)))

        def write_evidence_once() -> str:
            row = evidence_writer.create_evidence_ledger(ledger, f"evidence-ledger:{self.namespace}:{result.measurement_record_id}")
            return str(row["evidence_ledger_id"])

        with ThreadPoolExecutor(max_workers=2) as executor:
            evidence_ids = list(executor.map(lambda _index: write_evidence_once(), range(2)))
        self.assertEqual(evidence_ids[0], evidence_ids[1])

        owner_evidence = self._rest_as_user(
            self.user_a,
            "GET",
            f"evidence_ledgers?{urlencode({'id': f'eq.{evidence_ids[0]}', 'select': 'id,status,status_counts,entries,evidence_engine_version'})}",
        )
        self.assertEqual(len(owner_evidence), 1)
        self.assertEqual(owner_evidence[0]["evidence_engine_version"], "soulscope-evidence-engine-0.1.0")
        self.assertGreater(owner_evidence[0]["status_counts"]["supported"], 0)
        self.assertTrue(owner_evidence[0]["entries"])

        user_b_evidence = self._rest_as_user(
            self.user_b,
            "GET",
            f"evidence_ledgers?{urlencode({'id': f'eq.{evidence_ids[0]}', 'select': 'id'})}",
        )
        self.assertEqual(user_b_evidence, [])

        with self.assertRaises(HostedHttpError):
            self._rest_as_user(
                self.user_a,
                "PATCH",
                f"evidence_ledgers?{urlencode({'id': f'eq.{evidence_ids[0]}'})}",
                {"status": "invalid"},
            )

        owner_semantic = self._rest_as_user(
            self.user_a,
            "GET",
            f"semantic_result_records?{urlencode({'id': f'eq.{result.semantic_result_id}', 'select': 'id,status,pattern_result,dimensions'})}",
        )
        self.assertEqual(owner_semantic[0]["status"], "unresolved_abstained")
        self.assertEqual(owner_semantic[0]["pattern_result"]["publicationStatus"], "NO_PATTERN_PUBLISHED")

        user_b_measurements = self._rest_as_user(
            self.user_b,
            "GET",
            f"measurement_records?{urlencode({'id': f'eq.{result.measurement_record_id}', 'select': 'id'})}",
        )
        self.assertEqual(user_b_measurements, [])

        with self.assertRaises(HostedHttpError):
            self._rest_as_user(
                self.user_a,
                "PATCH",
                f"measurement_records?{urlencode({'id': f'eq.{result.measurement_record_id}'})}",
                {"quality_summary": {"tamper": True}},
            )

        for object_path in list(self.created_object_paths):
            self.assertTrue(self.storage.delete(object_path))
            self.created_object_paths.remove(object_path)

    def test_hosted_idempotent_artifact_and_processing_start_requests(self) -> None:
        scan_id, captures = self._create_ready_scan(self.user_a)
        writer = MeasurementWriter(SupabaseRestRpc(self.supabase_url, ServiceAuth(self.service_role_key)))
        first_capture_id = captures["P1_OPEN_REFERENCE"]
        object_path = f"{scan_id}/P1_OPEN_REFERENCE_{first_capture_id}.wav"
        self.storage.store_canonical_wav(
            fixture_path("P1_OPEN_REFERENCE.wav"),
            scan_id,
            first_capture_id,
            "P1_OPEN_REFERENCE",
        )
        self.created_object_paths.append(object_path)

        first_artifact = writer.register_artifact(
            first_capture_id,
            self.bucket,
            object_path,
            "audio/wav",
            fixture_path("P1_OPEN_REFERENCE.wav").stat().st_size,
            "a" * 64,
            f"artifact:{self.namespace}:{first_capture_id}",
        )
        second_artifact = writer.register_artifact(
            first_capture_id,
            self.bucket,
            object_path,
            "audio/wav",
            fixture_path("P1_OPEN_REFERENCE.wav").stat().st_size,
            "a" * 64,
            f"artifact:{self.namespace}:{first_capture_id}",
        )
        self.assertEqual(first_artifact["artifact_id"], second_artifact["artifact_id"])

        for prompt_id, capture_id in captures.items():
            if prompt_id == "P1_OPEN_REFERENCE":
                continue
            path = self.storage.store_canonical_wav(
                fixture_path(f"{prompt_id}.wav"),
                scan_id,
                capture_id,
                prompt_id,
            ).storage_object_path
            self.created_object_paths.append(path)
            writer.register_artifact(
                capture_id,
                self.bucket,
                path,
                "audio/wav",
                fixture_path(f"{prompt_id}.wav").stat().st_size,
                "b" * 64,
                f"artifact:{self.namespace}:{capture_id}",
            )

        def start_once() -> str:
            row = writer.start_processing_run(scan_id, f"processing-run:{self.namespace}:{scan_id}")
            return str(row["processing_run_id"])

        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(lambda _index: start_once(), range(2)))

        self.assertEqual(results[0], results[1])

    def _create_ready_scan(self, session: Session) -> tuple[str, dict[str, str]]:
        prompt_set = self._active_prompt_set(session)
        prompt_definitions = self._prompt_definitions(session, prompt_set["id"])
        scan = self._rest_as_user(
            session,
            "POST",
            "scan_sessions",
            {"user_id": session.user_id, "prompt_set_id": prompt_set["id"]},
            prefer="return=representation",
        )[0]
        scan_id = scan["id"]
        self.created_scan_ids.append(scan_id)
        self._rpc_as_user(
            session,
            "transition_scan_lifecycle",
            {
                "requested_scan_id": scan_id,
                "requested_next_state": "capturing",
                "transition_details": {"testNamespace": self.namespace},
            },
        )
        captures: dict[str, str] = {}
        now = datetime.now(UTC).isoformat()
        for definition in prompt_definitions:
            capture = self._rest_as_user(
                session,
                "POST",
                "scan_prompt_captures",
                {
                    "scan_id": scan_id,
                    "prompt_definition_id": definition["id"],
                    "prompt_order": definition["prompt_order"],
                    "capture_status": "uploaded",
                    "duration_ms": 1000,
                    "upload_status": "uploaded",
                    "completed_at": now,
                },
                prefer="return=representation",
            )[0]
            captures[definition["canonical_key"]] = capture["id"]
        self._rpc_as_user(
            session,
            "transition_scan_lifecycle",
            {
                "requested_scan_id": scan_id,
                "requested_next_state": "capture_complete",
                "transition_details": {"testNamespace": self.namespace},
            },
        )
        self._rpc_as_user(
            session,
            "transition_scan_lifecycle",
            {
                "requested_scan_id": scan_id,
                "requested_next_state": "queued",
                "transition_details": {"testNamespace": self.namespace},
            },
        )
        return scan_id, captures

    def _active_prompt_set(self, session: Session) -> dict[str, Any]:
        rows = self._rest_as_user(session, "GET", "prompt_sets?status=eq.active&select=id,version&limit=1")
        if not rows:
            raise unittest.SkipTest("Hosted staging project has no active prompt set.")
        return rows[0]

    def _prompt_definitions(self, session: Session, prompt_set_id: str) -> list[dict[str, Any]]:
        query = urlencode(
            {
                "prompt_set_id": f"eq.{prompt_set_id}",
                "select": "id,canonical_key,prompt_order",
                "order": "prompt_order.asc",
            }
        )
        rows = self._rest_as_user(session, "GET", f"prompt_definitions?{query}")
        if [row["canonical_key"] for row in rows] != list(PROMPT_IDS):
            raise unittest.SkipTest("Hosted staging prompt set does not match the three-prompt protocol.")
        return rows

    def _password_session(self, email: str, password: str) -> Session:
        response = self._request(
            "POST",
            "auth/v1/token?grant_type=password",
            self.anon_key,
            None,
            {"email": email, "password": password},
        )
        user = response["user"]
        return Session(user_id=user["id"], access_token=response["access_token"])

    def _rpc_as_user(self, session: Session, name: str, payload: dict[str, Any]) -> Any:
        return self._rpc_with_key(self.anon_key, session.access_token, name, payload)

    def _rpc_with_key(
        self,
        api_key: str,
        access_token: str | None,
        name: str,
        payload: dict[str, Any],
    ) -> Any:
        return self._request("POST", f"rest/v1/rpc/{name}", api_key, access_token, payload)

    def _rest_as_user(
        self,
        session: Session,
        method: str,
        route: str,
        payload: dict[str, Any] | None = None,
        prefer: str | None = None,
    ) -> Any:
        return self._request(method, f"rest/v1/{route}", self.anon_key, session.access_token, payload, prefer)

    def _rest_with_key(
        self,
        api_key: str,
        method: str,
        route: str,
        payload: dict[str, Any] | None = None,
        prefer: str | None = None,
    ) -> Any:
        return self._request(method, f"rest/v1/{route}", api_key, None, payload, prefer)

    def _request(
        self,
        method: str,
        route: str,
        api_key: str,
        access_token: str | None,
        payload: dict[str, Any] | None = None,
        prefer: str | None = None,
    ) -> Any:
        headers = {
            "apikey": api_key,
            "authorization": f"Bearer {access_token or api_key}",
            "content-type": "application/json",
        }
        if prefer:
            headers["prefer"] = prefer
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(f"{self.supabase_url}/{route}", data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=30) as response:
                data = response.read()
        except HTTPError as exc:
            raise HostedHttpError(method, route, exc.code, exc.read().decode("utf-8", errors="replace")) from exc
        if not data:
            return None
        return json.loads(data.decode("utf-8"))


def _safe_detail(detail: str) -> str:
    lowered = detail.lower()
    if "permission" in lowered or "not authorized" in lowered:
        return "PERMISSION_DENIED"
    if "not found" in lowered:
        return "NOT_FOUND"
    if "jwt" in lowered or "token" in lowered:
        return "AUTH_ERROR"
    return "REQUEST_FAILED"
