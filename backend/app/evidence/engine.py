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
from .markers import MARKER_RULES, MARKER_VERSION, PROMPT_IDS
from .models import EvidenceLedger, EvidenceStatus, MeasurementInput, MeasurementRecordInput


def evaluate_evidence(record: MeasurementRecordInput) -> EvidenceLedger:
    measurements = _flatten_measurements(record)
    by_prompt_feature = {(item.capture_kind, item.feature_id): item for item in measurements}
    entries: list[dict[str, Any]] = []
    for marker in MARKER_RULES:
        for prompt_scope in marker.prompt_scopes:
            entries.append(_entry_for_marker(record, marker, prompt_scope, by_prompt_feature, entries))

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
            parsed_parameters = deepcopy(parameters) if isinstance(parameters, dict) else {}
            if raw.get("implementation_status") is not None:
                parsed_parameters["implementation_status"] = str(raw.get("implementation_status"))
            if raw.get("feature_registry_version") is not None:
                parsed_parameters["feature_registry_version"] = str(raw.get("feature_registry_version"))
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
                    parameters=parsed_parameters,
                    device_metadata=deepcopy(device_metadata) if isinstance(device_metadata, dict) else {},
                )
            )
    return tuple(flattened)


def _entry_for_marker(
    record: MeasurementRecordInput,
    marker: Any,
    prompt_scope: str,
    by_prompt_feature: dict[tuple[str, str], MeasurementInput],
    prior_entries: list[dict[str, Any]],
) -> dict[str, Any]:
    timestamp = record.created_at or "1970-01-01T00:00:00+00:00"
    component_states = _component_states(marker, prompt_scope, by_prompt_feature, prior_entries)
    source_measurement_ids = [state["measurement_id"] for state in component_states if state.get("measurement_id")]
    supporting_components = [state["component_id"] for state in component_states if state["state"] == "supported"]
    rejected_components = [state["component_id"] for state in component_states if state["state"] == "rejected"]
    insufficient_components = [state["component_id"] for state in component_states if state["state"] == "insufficient"]
    missing_components = [state["component_id"] for state in component_states if state["state"] == "unavailable"]
    eligible_count = len(supporting_components)
    if rejected_components:
        evidence_status: EvidenceStatus = "rejected"
        status = "UNRESOLVED"
        resolution_reason = "QUALITY_GATE_FAILED"
    elif eligible_count >= marker.minimum_independent_inputs:
        evidence_status = "supported"
        status = "RESOLVED"
        resolution_reason = None
    elif insufficient_components or eligible_count > 0:
        evidence_status = "insufficient"
        status = "UNRESOLVED"
        resolution_reason = "INSUFFICIENT_ELIGIBLE_COMPONENTS"
    else:
        evidence_status = "unavailable"
        status = "UNRESOLVED"
        resolution_reason = "MISSING_REQUIRED_EVIDENCE"

    first_measurement = next((state["measurement"] for state in component_states if state.get("measurement") is not None), None)
    source_capture_id = first_measurement.source_capture_id if first_measurement is not None else None
    method = first_measurement.method if first_measurement is not None else None
    extractor_version = first_measurement.extractor_version if first_measurement is not None else record.extractor_version
    segment_start_ms = first_measurement.segment_start_ms if first_measurement is not None else None
    segment_end_ms = first_measurement.segment_end_ms if first_measurement is not None else None
    quality = {
        "component_states": [
            {
                "component_id": state["component_id"],
                "state": state["state"],
                "quality": state.get("quality"),
                "rejection_reason": state.get("rejection_reason"),
            }
            for state in component_states
        ],
        "minimum_independent_inputs": marker.minimum_independent_inputs,
        "eligible_component_count": eligible_count,
    }

    evidence_id = _stable_id(
        "evidence",
        record.measurement_record_id,
        prompt_scope,
        marker.marker_id,
        EVIDENCE_ENGINE_VERSION,
        EVIDENCE_RULE_VERSION,
    )
    entry = {
        "evidence_id": evidence_id,
        "evidence_status": evidence_status,
        "marker_id": marker.marker_id,
        "marker_version": MARKER_VERSION,
        "scan_id": record.scan_id,
        "prompt_scope": [prompt_scope],
        "time_scope": {"start_time": segment_start_ms, "end_time": segment_end_ms},
        "reference_scope": _reference_scope(prompt_scope, record.measurement_record_id),
        "source_measurement_ids": source_measurement_ids,
        "source_feature_families": [marker.family],
        "source_feature_id": None,
        "source_feature_version": None,
        "source_capture_id": source_capture_id,
        "value": None,
        "unit": None,
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
        "insufficient_components": insufficient_components,
        "confound_flags": [],
        "rule_id": f"{marker.marker_id}:STRUCTURAL_COMPONENT_ELIGIBILITY",
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
            "accepted_inputs": supporting_components,
            "rejected_inputs": rejected_components,
            "missing_inputs": missing_components,
            "insufficient_inputs": insufficient_components,
            "source_evidence_families": [marker.family],
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


def _component_states(
    marker: Any,
    prompt_scope: str,
    by_prompt_feature: dict[tuple[str, str], MeasurementInput],
    prior_entries: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    states: list[dict[str, Any]] = []
    for component_id in marker.candidate_feature_ids:
        if component_id.startswith("EV_"):
            matched_entries = [
                entry
                for entry in prior_entries
                if entry.get("marker_id") == component_id and _scope_compatible(prompt_scope, entry.get("prompt_scope"))
            ]
            if not matched_entries:
                states.append({"component_id": component_id, "state": "unavailable", "measurement_id": None, "measurement": None})
                continue
            if any(entry.get("evidence_status") == "supported" for entry in matched_entries):
                states.append({"component_id": component_id, "state": "supported", "measurement_id": None, "measurement": None})
            elif any(entry.get("evidence_status") == "rejected" for entry in matched_entries):
                states.append({"component_id": component_id, "state": "rejected", "measurement_id": None, "measurement": None})
            else:
                states.append({"component_id": component_id, "state": "insufficient", "measurement_id": None, "measurement": None})
            continue

        prompt_ids = PROMPT_IDS if prompt_scope == "ALL_PROMPTS" or "_VS_" in prompt_scope else (prompt_scope,)
        measurements = [by_prompt_feature[(prompt_id, component_id)] for prompt_id in prompt_ids if (prompt_id, component_id) in by_prompt_feature]
        if not measurements:
            states.append({"component_id": component_id, "state": "unavailable", "measurement_id": None, "measurement": None})
            continue
        measurement = measurements[0]
        rejected = measurement.quality in {"rejected", "not_available"} or measurement.rejection_reason is not None
        implementation_status = str(measurement.parameters.get("implementation_status") or "")
        if measurement.value is None and rejected:
            state = "rejected"
        elif measurement.value is None:
            state = "unavailable"
        elif measurement.quality == "limited" or implementation_status == "PROVISIONAL_NON_CANONICAL":
            state = "insufficient"
        else:
            state = "supported"
        states.append(
            {
                "component_id": component_id,
                "state": state,
                "measurement_id": measurement.measurement_id,
                "measurement": measurement,
                "quality": measurement.quality,
                "rejection_reason": measurement.rejection_reason,
            }
        )
    return states


def _scope_compatible(prompt_scope: str, entry_scope: object) -> bool:
    if prompt_scope == "ALL_PROMPTS":
        return True
    if isinstance(entry_scope, list):
        return prompt_scope in entry_scope or "ALL_PROMPTS" in entry_scope
    return False


def _reference_scope(prompt_scope: str, measurement_record_id: str) -> dict[str, str]:
    if "_VS_" in prompt_scope or prompt_scope == "ALL_PROMPTS":
        reference_type = "WITHIN_SESSION"
    else:
        reference_type = "WITHIN_PROMPT"
    return {"reference_type": reference_type, "reference_id": measurement_record_id}


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
