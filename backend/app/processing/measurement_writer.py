from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..config import EXTRACTOR_VERSION
from ..database import SupabaseRpc


@dataclass(frozen=True)
class MeasurementWriter:
    rpc: SupabaseRpc

    def register_artifact(
        self,
        capture_id: str,
        storage_bucket: str,
        storage_object_path: str,
        mime_type: str,
        byte_size: int,
        checksum_sha256: str,
        idempotency_key: str,
    ) -> dict[str, Any]:
        return self.rpc.call_rpc(
            "register_uploaded_capture_artifact",
            {
                "p_capture_id": capture_id,
                "p_storage_bucket": storage_bucket,
                "p_storage_object_path": storage_object_path,
                "p_mime_type": mime_type,
                "p_byte_size": byte_size,
                "p_checksum_sha256": checksum_sha256,
                "p_idempotency_key": idempotency_key,
            },
        )

    def start_processing_run(self, scan_id: str, idempotency_key: str) -> dict[str, Any]:
        return self.rpc.call_rpc(
            "start_scan_processing_run",
            {
                "p_scan_id": scan_id,
                "p_idempotency_key": idempotency_key,
                "p_extractor_version": EXTRACTOR_VERSION,
                "p_renderer_registry_version": "CALIBRATION_REQUIRED",
            },
        )

    def create_measurement_record(
        self,
        processing_run_id: str,
        idempotency_key: str,
        measurement_status: str,
        prompt_measurements: list[dict[str, object]],
        prompt_contrasts: list[dict[str, object]],
        quality_summary: dict[str, object],
        semantic_eligibility: bool,
        renderer_eligibility: bool,
    ) -> dict[str, Any]:
        return self.rpc.call_rpc(
            "create_measurement_record",
            {
                "p_processing_run_id": processing_run_id,
                "p_idempotency_key": idempotency_key,
                "p_measurement_status": measurement_status,
                "p_prompt_measurements": prompt_measurements,
                "p_prompt_contrasts": prompt_contrasts,
                "p_quality_summary": quality_summary,
                "p_extractor_provenance": {
                    "extractor": "soulscope_measurement_worker",
                    "extractor_version": EXTRACTOR_VERSION,
                    "calibration_status": "CALIBRATION_REQUIRED",
                },
                "p_semantic_eligibility": semantic_eligibility,
                "p_renderer_eligibility": renderer_eligibility,
            },
        )

    def create_unresolved_semantic_result(
        self, measurement_record_id: str, idempotency_key: str
    ) -> dict[str, Any]:
        return self.rpc.call_rpc(
            "create_unresolved_semantic_result",
            {
                "p_measurement_record_id": measurement_record_id,
                "p_idempotency_key": idempotency_key,
            },
        )
