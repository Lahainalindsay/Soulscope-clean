from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

from ..acoustics.extractor import extract_measurements
from ..config import Settings
from ..logging import safe_log_context
from ..storage.base import PrivateAudioStorage
from ..storage.local import LocalPrivateAudioStorage
from .measurement_writer import MeasurementWriter
from .quality import aggregate_quality, evaluate_prompt_quality

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class PromptAudioInput:
    prompt_id: str
    capture_id: str
    source_path: Path


@dataclass(frozen=True)
class ScanProcessingResult:
    scan_id: str
    processing_run_id: str
    measurement_record_id: str
    semantic_result_id: str
    measurement_status: str
    semantic_status: str


class ScanWorker:
    def __init__(
        self,
        settings: Settings,
        writer: MeasurementWriter,
        storage: PrivateAudioStorage | None = None,
    ) -> None:
        self.settings = settings
        self.writer = writer
        self.storage = storage or LocalPrivateAudioStorage(settings)

    def process_scan(self, scan_id: str, prompts: list[PromptAudioInput]) -> ScanProcessingResult:
        if len(prompts) != 3:
            raise ValueError("all three prompt inputs are required")

        logger.info("scan_processing_started", extra=safe_log_context(scan_id=scan_id))
        prompt_measurements: list[dict[str, object]] = []
        for prompt in sorted(prompts, key=lambda item: item.prompt_id):
            stored = self.storage.store_canonical_wav(
                prompt.source_path,
                scan_id,
                prompt.capture_id,
                prompt.prompt_id,
            )
            self.writer.register_artifact(
                capture_id=prompt.capture_id,
                storage_bucket=stored.storage_bucket,
                storage_object_path=stored.storage_object_path,
                mime_type=stored.mime_type,
                byte_size=stored.byte_size,
                checksum_sha256=stored.checksum_sha256,
                idempotency_key=f"artifact:{scan_id}:{prompt.capture_id}",
            )
            prompt_measurements.append(
                extract_measurements(
                    stored.path,
                    prompt.capture_id,
                    prompt.prompt_id,
                    self.settings.silence_rms_threshold,
                )
            )
            logger.info(
                "capture_measurements_extracted",
                extra=safe_log_context(
                    scan_id=scan_id,
                    capture_id=prompt.capture_id,
                    prompt_id=prompt.prompt_id,
                ),
            )

        run = self.writer.start_processing_run(scan_id, f"processing-run:{scan_id}")
        processing_run_id = str(run["processing_run_id"])

        quality_results = [
            evaluate_prompt_quality(measurement, self.settings) for measurement in prompt_measurements
        ]
        aggregate = aggregate_quality(quality_results)
        quality_summary = {
            "status": aggregate.status,
            "semanticEligibility": aggregate.semantic_eligibility,
            "rendererEligibility": aggregate.renderer_eligibility,
            "rejectionReasons": list(aggregate.rejection_reasons),
            "warnings": list(aggregate.warnings),
        }

        measurement = self.writer.create_measurement_record(
            processing_run_id=processing_run_id,
            idempotency_key=f"measurement:{scan_id}:{processing_run_id}",
            measurement_status=aggregate.status,
            prompt_measurements=prompt_measurements,
            prompt_contrasts=[],
            quality_summary=quality_summary,
            semantic_eligibility=aggregate.semantic_eligibility,
            renderer_eligibility=aggregate.renderer_eligibility,
        )

        measurement_record_id = str(measurement["measurement_record_id"])
        semantic = self.writer.create_unresolved_semantic_result(
            measurement_record_id,
            f"semantic-unresolved:{scan_id}:{measurement_record_id}",
        )

        logger.info(
            "scan_processing_completed",
            extra=safe_log_context(
                scan_id=scan_id,
                processing_run_id=processing_run_id,
                measurement_record_id=measurement_record_id,
            ),
        )
        return ScanProcessingResult(
            scan_id=scan_id,
            processing_run_id=processing_run_id,
            measurement_record_id=measurement_record_id,
            semantic_result_id=str(semantic["semantic_result_id"]),
            measurement_status=str(measurement["measurement_status"]),
            semantic_status=str(semantic["status"]),
        )
