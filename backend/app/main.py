from __future__ import annotations

import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Annotated
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from .auth import ServiceAuth
from .config import Settings, require_service_settings
from .database import SupabaseRestRpc
from .dimensions.service import DimensionService
from .dimensions.writer import DimensionWriter
from .evidence.service import EvidenceService
from .evidence.writer import EvidenceWriter
from .logging import configure_logging
from .processing.measurement_writer import MeasurementWriter
from .processing.worker import PromptAudioInput, ScanWorker
from .storage.base import PrivateAudioStorage
from .storage.local import LocalPrivateAudioStorage
from .storage.supabase import SupabasePrivateAudioStorage

configure_logging()
app = FastAPI(title="SoulScope Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(Settings.from_env().allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["authorization", "content-type"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "soulscope-backend", "mode": "measurement-only"}


def build_private_audio_storage() -> PrivateAudioStorage:
    settings = require_service_settings()
    if settings.storage_backend == "supabase":
        storage = SupabasePrivateAudioStorage(
            settings,
            ServiceAuth(settings.supabase_service_role_key),
        )
        storage.ensure_private_bucket()
        return storage
    return LocalPrivateAudioStorage(settings)


def _bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing bearer token")
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing bearer token")
    return token


def _supabase_json_request(
    url: str,
    api_key: str,
    authorization: str,
    method: str = "GET",
    payload: dict[str, object] | None = None,
) -> object:
    headers = {
        "apikey": api_key,
        "authorization": authorization,
        "content-type": "application/json",
    }
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(request, timeout=30) as response:
            raw = response.read()
    except HTTPError as exc:
        if exc.code in (401, 403):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid Supabase session") from exc
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase request failed") from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase unavailable") from exc
    if not raw:
        return None
    return json.loads(raw.decode("utf-8"))


def _verified_user_id(settings_supabase_url: str, anon_key: str, token: str) -> str:
    payload = _supabase_json_request(
        f"{settings_supabase_url}/auth/v1/user",
        anon_key,
        f"Bearer {token}",
    )
    if not isinstance(payload, dict) or not payload.get("id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid Supabase session")
    return str(payload["id"])


def _assert_scan_owner(settings_supabase_url: str, service_role_key: str, scan_id: str, user_id: str) -> None:
    query = urlencode({"id": f"eq.{scan_id}", "select": "id,user_id,lifecycle_state", "limit": "1"})
    payload = _supabase_json_request(
        f"{settings_supabase_url}/rest/v1/scan_sessions?{query}",
        service_role_key,
        f"Bearer {service_role_key}",
    )
    if not isinstance(payload, list) or not payload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="scan not found")
    if str(payload[0].get("user_id")) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="scan is not owned by the authenticated user")


def _canonical_pipeline_services(settings):
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    storage = build_private_audio_storage()
    return auth, rpc, storage


@app.post("/process-scan")
async def process_user_scan(
    scan_id: Annotated[str, Form()],
    p1_capture_id: Annotated[str, Form()],
    p2_capture_id: Annotated[str, Form()],
    p3_capture_id: Annotated[str, Form()],
    p1_audio: Annotated[UploadFile, File()],
    p2_audio: Annotated[UploadFile, File()],
    p3_audio: Annotated[UploadFile, File()],
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    settings = require_service_settings()
    token = _bearer_token(authorization)
    user_id = _verified_user_id(settings.supabase_url, settings.supabase_anon_key, token)
    _assert_scan_owner(settings.supabase_url, settings.supabase_service_role_key, scan_id, user_id)

    auth, rpc, storage = _canonical_pipeline_services(settings)
    worker = ScanWorker(settings, MeasurementWriter(rpc), storage)
    with NamedTemporaryFile(suffix=".wav") as p1, NamedTemporaryFile(
        suffix=".wav"
    ) as p2, NamedTemporaryFile(suffix=".wav") as p3:
        p1.write(await p1_audio.read())
        p2.write(await p2_audio.read())
        p3.write(await p3_audio.read())
        p1.flush()
        p2.flush()
        p3.flush()
        result = worker.process_scan(
            scan_id,
            [
                PromptAudioInput("P1_OPEN_REFERENCE", p1_capture_id, Path(p1.name)),
                PromptAudioInput("P2_TROUBLING_CONTEXT", p2_capture_id, Path(p2.name)),
                PromptAudioInput("P3_FUTURE_CONTEXT", p3_capture_id, Path(p3.name)),
            ],
        )

    evidence_service = EvidenceService(settings.supabase_url, auth, EvidenceWriter(rpc))
    evidence = evidence_service.process_measurement_record(result.measurement_record_id)
    dimension_service = DimensionService(settings.supabase_url, auth, DimensionWriter(rpc))
    dimensions = dimension_service.process_evidence_ledger(str(evidence["evidence_ledger_id"]))

    return {
        "scan_id": result.scan_id,
        "processing_run_id": result.processing_run_id,
        "measurement_record_id": result.measurement_record_id,
        "semantic_result_id": result.semantic_result_id,
        "measurement_status": result.measurement_status,
        "semantic_status": result.semantic_status,
        "evidence_ledger_id": str(evidence["evidence_ledger_id"]),
        "evidence_status": str(evidence["status"]),
        "dimension_result_id": str(dimensions["dimension_result_id"]),
        "dimension_status": str(dimensions["status"]),
    }

@app.post("/internal/process-scan")
async def process_scan(
    scan_id: Annotated[str, Form()],
    p1_capture_id: Annotated[str, Form()],
    p2_capture_id: Annotated[str, Form()],
    p3_capture_id: Annotated[str, Form()],
    p1_audio: Annotated[UploadFile, File()],
    p2_audio: Annotated[UploadFile, File()],
    p3_audio: Annotated[UploadFile, File()],
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    settings = require_service_settings()
    if settings.worker_internal_token and x_worker_token != settings.worker_internal_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid worker token",
        )
    rpc = SupabaseRestRpc(settings.supabase_url, ServiceAuth(settings.supabase_service_role_key))
    if settings.storage_backend == "supabase":
        supabase_storage = SupabasePrivateAudioStorage(
            settings,
            ServiceAuth(settings.supabase_service_role_key),
        )
        supabase_storage.ensure_private_bucket()
        storage: PrivateAudioStorage = supabase_storage
    else:
        storage = LocalPrivateAudioStorage(settings)
    worker = ScanWorker(settings, MeasurementWriter(rpc), storage)
    with NamedTemporaryFile(suffix=".wav") as p1, NamedTemporaryFile(
        suffix=".wav"
    ) as p2, NamedTemporaryFile(suffix=".wav") as p3:
        p1.write(await p1_audio.read())
        p2.write(await p2_audio.read())
        p3.write(await p3_audio.read())
        p1.flush()
        p2.flush()
        p3.flush()
        result = worker.process_scan(
            scan_id,
            [
                PromptAudioInput("P1_OPEN_REFERENCE", p1_capture_id, Path(p1.name)),
                PromptAudioInput("P2_TROUBLING_CONTEXT", p2_capture_id, Path(p2.name)),
                PromptAudioInput("P3_FUTURE_CONTEXT", p3_capture_id, Path(p3.name)),
            ],
        )
    return {
        "scan_id": result.scan_id,
        "processing_run_id": result.processing_run_id,
        "measurement_record_id": result.measurement_record_id,
        "semantic_result_id": result.semantic_result_id,
        "measurement_status": result.measurement_status,
        "semantic_status": result.semantic_status,
    }


@app.post("/internal/process-evidence")
async def process_evidence(
    measurement_record_id: Annotated[str, Form()],
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    settings = require_service_settings()
    if settings.worker_internal_token and x_worker_token != settings.worker_internal_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid worker token",
        )
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    service = EvidenceService(settings.supabase_url, auth, EvidenceWriter(rpc))
    result = service.process_measurement_record(measurement_record_id)
    return {
        "evidence_ledger_id": str(result["evidence_ledger_id"]),
        "scan_id": str(result["scan_id"]),
        "measurement_record_id": str(result["measurement_record_id"]),
        "status": str(result["status"]),
    }


@app.post("/internal/process-dimensions")
async def process_dimensions(
    evidence_ledger_id: Annotated[str, Form()],
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    settings = require_service_settings()
    if settings.worker_internal_token and x_worker_token != settings.worker_internal_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid worker token",
        )
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    service = DimensionService(settings.supabase_url, auth, DimensionWriter(rpc))
    result = service.process_evidence_ledger(evidence_ledger_id)
    return {
        "dimension_result_id": str(result["dimension_result_id"]),
        "scan_id": str(result["scan_id"]),
        "evidence_ledger_id": str(result["evidence_ledger_id"]),
        "status": str(result["status"]),
    }
