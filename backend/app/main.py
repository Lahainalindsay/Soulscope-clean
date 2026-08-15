from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Annotated

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile, status

from .auth import ServiceAuth
from .config import require_service_settings
from .database import SupabaseRestRpc
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
