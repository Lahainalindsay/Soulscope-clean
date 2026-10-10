from __future__ import annotations

from hmac import compare_digest
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import IO, Annotated, Any

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

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
from .results.service import ResultService
from .storage.base import PrivateAudioStorage
from .storage.local import LocalPrivateAudioStorage
from .storage.supabase import SupabasePrivateAudioStorage

configure_logging()
app = FastAPI(title="SoulScope Backend", version="0.1.0")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "soulscope-backend", "mode": "canonical-calibration-gated"}


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
) -> dict[str, Any]:
    settings = require_service_settings()
    authorize_worker(settings, x_worker_token)
    rpc = SupabaseRestRpc(settings.supabase_url, ServiceAuth(settings.supabase_service_role_key))
    if settings.storage_backend == "supabase":
        supabase_storage = SupabasePrivateAudioStorage(
            settings,
            ServiceAuth(settings.supabase_service_role_key),
        )
        await run_in_threadpool(supabase_storage.ensure_private_bucket)
        storage: PrivateAudioStorage = supabase_storage
    else:
        storage = LocalPrivateAudioStorage(settings)
    worker = ScanWorker(settings, MeasurementWriter(rpc), storage)
    with NamedTemporaryFile(suffix=".wav") as p1, NamedTemporaryFile(
        suffix=".wav"
    ) as p2, NamedTemporaryFile(suffix=".wav") as p3:
        await copy_upload(p1_audio, p1.file, settings.max_upload_bytes)
        await copy_upload(p2_audio, p2.file, settings.max_upload_bytes)
        await copy_upload(p3_audio, p3.file, settings.max_upload_bytes)
        p1.flush()
        p2.flush()
        p3.flush()
        result = await run_in_threadpool(
            worker.process_scan, scan_id,
            [
                PromptAudioInput("P1_OPEN_REFERENCE", p1_capture_id, Path(p1.name)),
                PromptAudioInput("P2_TROUBLING_CONTEXT", p2_capture_id, Path(p2.name)),
                PromptAudioInput("P3_FUTURE_CONTEXT", p3_capture_id, Path(p3.name)),
            ],
        )
    completed = await run_in_threadpool(
        ResultService(settings.supabase_url, ServiceAuth(settings.supabase_service_role_key), rpc).complete_measurement,
        result.measurement_record_id,
    )
    return {
        **completed,
        "scan_id": result.scan_id,
        "processing_run_id": result.processing_run_id,
        "measurement_record_id": result.measurement_record_id,
        "semantic_result_id": completed["semantic_result_id"],
        "measurement_status": result.measurement_status,
        "semantic_status": completed["status"],
    }


@app.post("/internal/process-evidence")
async def process_evidence(
    measurement_record_id: Annotated[str, Form()],
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    settings = require_service_settings()
    authorize_worker(settings, x_worker_token)
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    service = EvidenceService(settings.supabase_url, auth, EvidenceWriter(rpc))
    result = await run_in_threadpool(service.process_measurement_record, measurement_record_id)
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
    authorize_worker(settings, x_worker_token)
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    service = DimensionService(settings.supabase_url, auth, DimensionWriter(rpc))
    result = await run_in_threadpool(service.process_evidence_ledger, evidence_ledger_id)
    return {
        "dimension_result_id": str(result["dimension_result_id"]),
        "scan_id": str(result["scan_id"]),
        "evidence_ledger_id": str(result["evidence_ledger_id"]),
        "status": str(result["status"]),
    }


def authorize_worker(settings: Settings, token: str | None) -> None:
    if not settings.worker_internal_token:
        raise HTTPException(status_code=503, detail="worker authentication is not configured")
    if not token or not compare_digest(token, settings.worker_internal_token):
        raise HTTPException(status_code=401, detail="invalid worker token")


async def copy_upload(upload: UploadFile, target: IO[bytes], limit: int) -> None:
    size = 0
    while chunk := await upload.read(64 * 1024):
        size += len(chunk)
        if size > limit:
            raise HTTPException(status_code=413, detail="audio upload exceeds size limit")
        target.write(chunk)


@app.post("/internal/process-result")
async def process_result(
    dimension_result_id: Annotated[str, Form()],
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, Any]:
    settings = require_service_settings()
    authorize_worker(settings, x_worker_token)
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    return await run_in_threadpool(
        ResultService(settings.supabase_url, auth, rpc).finalize_dimensions, dimension_result_id
    )


@app.post("/internal/complete-measurement")
async def complete_measurement(
    measurement_record_id: Annotated[str, Form()],
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, Any]:
    settings = require_service_settings()
    authorize_worker(settings, x_worker_token)
    auth = ServiceAuth(settings.supabase_service_role_key)
    rpc = SupabaseRestRpc(settings.supabase_url, auth)
    return await run_in_threadpool(
        ResultService(settings.supabase_url, auth, rpc).complete_measurement, measurement_record_id
    )


@app.post("/internal/verify-measurements")
async def verify_measurements(
    x_worker_token: Annotated[str | None, Header()] = None,
) -> dict[str, Any]:
    # Does not require database credentials or consume/store customer audio.
    from .acoustics.verification import verify_measurement_runtime

    authorize_worker(Settings.from_env(), x_worker_token)
    result = await run_in_threadpool(verify_measurement_runtime)
    if result["status"] != "PASS":
        raise HTTPException(status_code=503, detail=result)
    return result
