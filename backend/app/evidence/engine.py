from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from typing import Any

from ..config import (
    EVIDENCE_ENGINE_VERSION,
    EVIDENCE_LEDGER_SCHEMA_VERSION,
    EVIDENCE_REGISTRY_VERSION,
    EVIDENCE_RULE_VERSION,
)
from .markers import EXPECTED_FEATURE_IDS, MARKER_VERSION, PROMPT_IDS, marker_for_feature
from .models import EvidenceLedger, EvidenceStatus, MeasurementInput, MeasurementRecordInput


def evaluate_evidence(record: MeasurementRecordInput) -> EvidenceLedger:
    measurements = _flatten_measurements(record)
    by_prompt_feature = {(item.capture_kind, item.feature_id): item for item in measurements}
    entries: list[dict[str, Any]] = []
    for prompt_id in PROMPT_IDS:
        for feature_id in EXPECTED_FEATURE_IDS:
            measurement = by_prompt_feature.get((prompt_id, feature_id))
            entries.append(_entry_for_expected_measurement(record, prompt_id, feature_id, measurement))

    ordered = tuple(sorted(entries, key=lambda item: item["evidence_id"]))
    status_counts = {status: 0 for status in ("supported", "contradicted", "unavailable", "rejected", "insufficient")}
    for entry in ordered:
        status_counts[str(entry["evidence_status"])] += 1

    return EvidenceLedger(
        measurement_record_id=record.measurement_record_id,
        scan_id=record.scan_id,
        processing_run_id=record.processing_run_id,
        evidence_engine_version=EVIDENCE_ENGINE_VERSION,
        evidence_rule_version=EVIDENCE_RULE_VERSION,
        evidence_registry_version=EVIDENCE_REGISTRY_VERSION,
        ledger_schema_version=EVIDENCE_LEDGER_SCHEMA_VERSION,
        entries=ordered,
        status_counts=status_counts,
        provenance={
            "source": "measurement_record",
            "measurement_record_id": record.measurement_record_id,
            "measurement_schema_version": record.measurement_schema_version,
            "extractor_version": record.extractor_version,
            "quality_rules_version": record.quality_rules_version,
            "input_contract": "MeasurementRecord v1 prompt_measurements",
            "raw_audio_consumed": False,
            "acoustic_extraction_rerun": False,
        },
    )


def _flatten_measurements(record: MeasurementRecordInput) -> tuple[MeasurementInput, ...]:
    flattened: list[MeasurementInput] = []
    for prompt in record.prompt_measurements:
        prompt_id = str(prompt.get("promptId") or "")
        capture_id = str(prompt.get("captureId") or "")
        raw_measurements = prompt.get("measurements", [])
        if not isinstance(raw_measurements, list):
            continue
        for index, raw in enumerate(raw_measurements):
            if not isinstance(raw, dict):
                continue
            feature_id = str(raw.get("feature_id") or "")
            if not feature_id:
                continue
            source_capture_id = str(raw.get("source_capture_id") or capture_id)
            capture_kind = str(raw.get("capture_kind") or prompt_id)
            measurement_id = _stable_id(
                "measurement",
                record.measurement_record_id,
                source_capture_id,
                capture_kind,
                feature_id,
                str(raw.get("feature_version") or "unknown"),
                str(index),
            )
            parameters = raw.get("parameters")
            device_metadata = raw.get("device_metadata")
            flattened.append(
                MeasurementInput(
                    measurement_id=measurement_id,
                    feature_id=feature_id,
                    feature_version=str(raw.get("feature_version") or "unknown"),
                    value=raw.get("value") if _json_scalar_or_none(raw.get("value")) else None,
                    unit=None if raw.get("unit") is None else str(raw.get("unit")),
                    method=None if raw.get("method") is None else str(raw.get("method")),
                    source_capture_id=source_capture_id,
                    capture_kind=capture_kind,
                    segment_start_ms=_number_or_none(raw.get("segment_start_ms")),
                    segment_end_ms=_number_or_none(raw.get("segment_end_ms")),
                    quality=None if raw.get("quality") is None else str(raw.get("quality")),
                    confidence=_number_or_none(raw.get("confidence")),
                    rejection_reason=None if raw.get("rejection_reason") is None else str(raw.get("rejection_reason")),
                    extractor=None if raw.get("extractor") is None else str(raw.get("extractor")),
                    extractor_version=None if raw.get("extractor_version") is None else str(raw.get("extractor_version")),
                    parameters=deepcopy(parameters) if isinstance(parameters, dict) else {},
                    device_metadata=deepcopy(device_metadata) if isinstance(device_metadata, dict) else {},
                )
            )
    return tuple(flattened)


def _entry_for_expected_measurement(
    record: MeasurementRecordInput,
    prompt_id: str,
    feature_id: str,
    measurement: MeasurementInput | None,
) -> dict[str, Any]:
    marker = marker_for_feature(feature_id)
    timestamp = record.created_at or "1970-01-01T00:00:00+00:00"
    if measurement is None:
        evidence_status: EvidenceStatus = "unavailable"
        source_measurement_ids: list[str] = []
        missing_components = [feature_id]
        rejected_components: list[str] = []
        supporting_components: list[str] = []
        quality: dict[str, object] = {"measurement_quality": "not_available"}
        value = None
        unit = None
        resolution_reason = "MISSING_REQUIRED_EVIDENCE"
        status = "UNRESOLVED"
        source_capture_id = None
        method = None
        extractor_version: str | None = record.extractor_version
        feature_version = "unknown"
        segment_start_ms = None
        segment_end_ms = None
    else:
        source_measurement_ids = [measurement.measurement_id]
        source_capture_id = measurement.source_capture_id
        method = measurement.method
        extractor_version = measurement.extractor_version
        feature_version = measurement.feature_version
        segment_start_ms = measurement.segment_start_ms
        segment_end_ms = measurement.segment_end_ms
        value = measurement.value
        unit = measurement.unit
        rejected = measurement.quality in {"rejected", "not_available"} or measurement.rejection_reason is not None
        if measurement.value is None and rejected:
            evidence_status = "rejected"
            status = "UNRESOLVED"
            resolution_reason = "QUALITY_GATE_FAILED"
            missing_components = []
            rejected_components = [feature_id]
            supporting_components = []
        elif measurement.value is None:
            evidence_status = "unavailable"
            status = "UNRESOLVED"
            resolution_reason = "MISSING_REQUIRED_EVIDENCE"
            missing_components = [feature_id]
            rejected_components = []
            supporting_components = []
        elif measurement.quality == "limited":
            evidence_status = "insufficient"
            status = "UNRESOLVED"
            resolution_reason = "QUALITY_GATE_FAILED"
            missing_components = []
            rejected_components = []
            supporting_components = []
        else:
            evidence_status = "supported"
            status = "RESOLVED"
            resolution_reason = None
            missing_components = []
            rejected_components = []
            supporting_components = [feature_id]
        quality = {
            "measurement_quality": measurement.quality,
            "confidence": measurement.confidence,
            "rejection_reason": measurement.rejection_reason,
        }

    evidence_id = _stable_id(
        "evidence",
        record.measurement_record_id,
        prompt_id,
        feature_id,
        EVIDENCE_ENGINE_VERSION,
        EVIDENCE_RULE_VERSION,
    )
    entry = {
        "evidence_id": evidence_id,
        "evidence_status": evidence_status,
        "marker_id": marker.marker_id,
        "marker_version": MARKER_VERSION,
        "scan_id": record.scan_id,
        "prompt_scope": [prompt_id],
        "time_scope": {"start_time": segment_start_ms, "end_time": segment_end_ms},
        "reference_scope": {"reference_type": "WITHIN_SCAN_PROMPT_MEASUREMENT", "reference_id": record.measurement_record_id},
        "source_measurement_ids": source_measurement_ids,
        "source_feature_families": [marker.family],
        "source_feature_id": feature_id,
        "source_feature_version": feature_version,
        "source_capture_id": source_capture_id,
        "value": value,
        "unit": unit,
        "direction": "NONE" if evidence_status == "supported" else "UNRESOLVED",
        "magnitude": None,
        "uncertainty": None,
        "quality": quality,
        "coverage": 1.0 if evidence_status == "supported" else 0.0,
        "agreement": None,
        "baseline_trust": None,
        "supporting_components": supporting_components,
        "contradicting_components": [],
        "missing_components": missing_components,
        "rejected_components": rejected_components,
        "confound_flags": [],
        "rule_id": "STRUCTURAL_MEASUREMENT_AVAILABILITY",
        "rule_version": EVIDENCE_RULE_VERSION,
        "status": status,
        "timestamp": timestamp,
        "provenance": {
            "measurement_record_id": record.measurement_record_id,
            "processing_run_id": record.processing_run_id,
            "source_capture_id": source_capture_id,
            "method": method,
            "extractor_version": extractor_version,
            "engine_version": EVIDENCE_ENGINE_VERSION,
            "raw_audio_consumed": False,
        },
        "version": {
            "protocol": record.protocol_version,
            "extractor": record.extractor_version,
            "featureRegistry": "0.1",
            "qualityRules": record.quality_rules_version,
            "evidenceRegistry": EVIDENCE_REGISTRY_VERSION,
        },
    }
    if resolution_reason is not None:
        entry["resolution_reason"] = resolution_reason
    return entry


def _stable_id(*parts: str) -> str:
    payload = json.dumps(parts, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:32]


def _number_or_none(value: object) -> int | float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int | float):
        return value
    return None


def _json_scalar_or_none(value: object) -> bool:
    return value is None or isinstance(value, str | int | float | bool)
