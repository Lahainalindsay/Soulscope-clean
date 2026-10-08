from __future__ import annotations

import importlib.util
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

if importlib.util.find_spec("fastapi") is None:
    raise unittest.SkipTest("Install backend[dev] to run API boundary tests.")

from fastapi.testclient import TestClient

from app.auth import ServiceAuth
from app.config import Settings
from app.main import app
from app.results.service import ResultService
from app.storage.local import LocalPrivateAudioStorage
from app.storage.supabase import SupabasePrivateAudioStorage, SupabaseStorageError

from .support import FakeRpc, fixture_path, write_wav


class CanonicalCompletionTests(unittest.TestCase):
    def test_completion_uses_persisted_stage_ids_in_order_and_propagates_failure(self) -> None:
        rpc = Mock()
        rpc.call_rpc.return_value = {"semantic_result_id": "semantic", "lifecycle_state": "finalized"}
        with patch("app.results.service.EvidenceService") as evidence, patch(
            "app.results.service.DimensionService"
        ) as dimensions:
            evidence.return_value.process_measurement_record.return_value = {"evidence_ledger_id": "ledger"}
            dimensions.return_value.process_evidence_ledger.return_value = {"dimension_result_id": "dimensions"}
            service = ResultService("https://example.test", ServiceAuth("private"), rpc)
            self.assertEqual(service.complete_measurement("measurement")["semantic_result_id"], "semantic")
            evidence.return_value.process_measurement_record.assert_called_once_with("measurement")
            dimensions.return_value.process_evidence_ledger.assert_called_once_with("ledger")
            rpc.call_rpc.assert_called_once_with("finalize_canonical_result", {"p_dimension_result_id": "dimensions"})
            rpc.reset_mock()
            dimensions.return_value.process_evidence_ledger.side_effect = RuntimeError("interrupted")
            with self.assertRaisesRegex(RuntimeError, "interrupted"):
                service.complete_measurement("measurement")
            rpc.call_rpc.assert_not_called()

    def test_every_internal_route_fails_closed_without_token_configuration(self) -> None:
        settings = Settings("https://example.test", "private", Path("/tmp/private"))
        client = TestClient(app)
        routes = {
            "/internal/process-evidence": {"measurement_record_id": "m"},
            "/internal/process-dimensions": {"evidence_ledger_id": "e"},
            "/internal/process-result": {"dimension_result_id": "d"},
            "/internal/complete-measurement": {"measurement_record_id": "m"},
            "/internal/process-scan": {"scan_id": "s", "p1_capture_id": "a", "p2_capture_id": "b", "p3_capture_id": "c"},
        }
        files = {f"p{i}_audio": ("audio.wav", b"audio", "audio/wav") for i in range(1, 4)}
        with patch("app.main.require_service_settings", return_value=settings):
            for route, data in routes.items():
                with self.subTest(route=route):
                    self.assertEqual(client.post(route, data=data, files=files if route.endswith("process-scan") else None).status_code, 503)

    def test_bad_token_denied_and_valid_token_can_finalize_only_by_id(self) -> None:
        settings = Settings("https://example.test", "private", Path("/tmp/private"), worker_internal_token="worker")
        client = TestClient(app)
        with patch("app.main.require_service_settings", return_value=settings), patch("app.main.ResultService") as service:
            self.assertEqual(client.post("/internal/process-result", data={"dimension_result_id": "d"}).status_code, 401)
            self.assertEqual(client.post("/internal/process-result", data={"dimension_result_id": "d"}, headers={"x-worker-token": "wrong"}).status_code, 401)
            service.return_value.finalize_dimensions.return_value = {"lifecycle_state": "finalized"}
            response = client.post("/internal/process-result", data={"dimension_result_id": "d"}, headers={"x-worker-token": "worker"})
            self.assertEqual(response.json(), {"lifecycle_state": "finalized"})
            service.return_value.finalize_dimensions.assert_called_once_with("d")

    def test_oversized_upload_stops_before_worker_and_storage(self) -> None:
        settings = Settings("https://example.test", "private", Path("/tmp/private"), max_upload_bytes=2, worker_internal_token="worker")
        with patch("app.main.require_service_settings", return_value=settings), patch("app.main.ScanWorker") as worker:
            response = TestClient(app).post("/internal/process-scan", headers={"x-worker-token": "worker"}, data={"scan_id":"s","p1_capture_id":"a","p2_capture_id":"b","p3_capture_id":"c"}, files={f"p{i}_audio": ("audio.wav", io.BytesIO(b"too large"), "audio/wav") for i in range(1,4)})
            self.assertEqual(response.status_code, 413)
            worker.return_value.process_scan.assert_not_called()

    def test_full_upload_extracts_real_fixtures_then_completes_the_saved_measurement(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            settings = Settings("https://example.test", "key", Path(tmp), worker_internal_token="worker")
            rpc = FakeRpc()
            with patch("app.main.require_service_settings", return_value=settings), patch("app.main.SupabaseRestRpc", return_value=rpc), patch("app.main.ResultService") as completion:
                completion.return_value.complete_measurement.return_value = {"semantic_result_id":"semantic", "status":"unresolved_abstained", "lifecycle_state":"finalized"}
                prompts = ["P1_OPEN_REFERENCE","P2_TROUBLING_CONTEXT","P3_FUTURE_CONTEXT"]
                response = TestClient(app).post("/internal/process-scan", headers={"x-worker-token":"worker"}, data={"scan_id":"scan","p1_capture_id":"a","p2_capture_id":"b","p3_capture_id":"c"}, files={f"p{i}_audio": ("audio.wav",fixture_path(prompt+".wav").read_bytes(),"audio/wav") for i,prompt in enumerate(prompts,1)})
                self.assertEqual(response.status_code,200)
                self.assertEqual(response.json()["lifecycle_state"],"finalized")
                completion.return_value.complete_measurement.assert_called_once_with(response.json()["measurement_record_id"])
                self.assertEqual([name for name,_ in rpc.calls][-1],"create_measurement_record")
                self.assertNotIn("create_unresolved_semantic_result",[name for name,_ in rpc.calls])

    def test_existing_local_capture_is_write_once_and_identical_retry_succeeds(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            storage = LocalPrivateAudioStorage(Settings("url", "key", Path(tmp)/"audio"))
            source = fixture_path("P1_OPEN_REFERENCE.wav")
            first = storage.store_canonical_wav(source, "scan", "capture", "P1_OPEN_REFERENCE")
            self.assertEqual(first, storage.store_canonical_wav(source, "scan", "capture", "P1_OPEN_REFERENCE"))
            changed = Path(tmp)/"changed.wav"
            write_wav(changed, [0.1]*16000)
            with self.assertRaisesRegex(ValueError, "CAPTURE_AUDIO_CONFLICT"):
                storage.store_canonical_wav(changed, "scan", "capture", "P1_OPEN_REFERENCE")
            self.assertEqual(first.path.read_bytes(), source.read_bytes())

    def test_supabase_collision_compares_bytes_and_never_upserts(self) -> None:
        storage = SupabasePrivateAudioStorage(Settings("https://example.test", "key", Path("/tmp/private")), ServiceAuth("key"))
        path = "scan/P1_OPEN_REFERENCE_capture.wav"
        with patch.object(SupabasePrivateAudioStorage, "_request_bytes", side_effect=SupabaseStorageError("upload", 409, "OBJECT_ALREADY_EXISTS")) as request, patch.object(SupabasePrivateAudioStorage, "download_bytes", return_value=b"existing"):
            storage.upload_bytes(path, b"existing", "audio/wav")
            self.assertEqual(request.call_args.kwargs["extra_headers"]["x-upsert"], "false")
            with self.assertRaisesRegex(ValueError, "CAPTURE_AUDIO_CONFLICT"):
                storage.upload_bytes(path, b"changed", "audio/wav")
