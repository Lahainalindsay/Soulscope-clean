from __future__ import annotations

from app.auth import ServiceAuth
from app.reflection.service import (
    SECTIONS,
    VERSION,
    ReflectionService,
    align_source_spans,
    validate_narrative,
)


def test_exact_span_verification_and_missing_section() -> None:
    capture = "11111111-1111-4111-8111-111111111111"
    source = "I want to make a plan with my sister."
    text = "You are making room for a plan with your sister."
    line = {"text": text, "sourceSpans": [{"captureId": capture, "start": 10, "end": 34,
                                            "quote": source[10:34]}]}
    narrative = {"schemaVersion": VERSION, "status": "READY",
                 "sections": {section: ([line] if section == "overview" else []) for section in SECTIONS}}
    assert validate_narrative(narrative, {capture: source})
    narrative["sections"]["overview"][0]["sourceSpans"][0]["quote"] = "a different plan"
    assert not validate_narrative(narrative, {capture: source})
    narrative["sections"].pop("relationships")
    assert not validate_narrative(narrative, {capture: source})


def test_server_finds_offsets_only_for_verbatim_quotes() -> None:
    capture = "11111111-1111-4111-8111-111111111111"
    source = "I want to make a plan with my sister."
    draft = {"schemaVersion": VERSION, "status": "READY", "sections": {
        section: ([{"text": "You want to make a plan with your sister.",
                   "sourceSpans": [{"captureId": capture, "quote": "make a plan with my sister"}]}]
                  if section == "overview" else []) for section in SECTIONS}}
    reading = align_source_spans(draft, {capture: source})
    assert reading and validate_narrative(reading, {capture: source})
    assert reading["sections"]["overview"][0]["sourceSpans"][0]["start"] == source.index("make a plan")
    draft["sections"]["overview"][0]["sourceSpans"][0]["quote"] = "fabricated quote"
    assert align_source_spans(draft, {capture: source}) is None


def test_quote_does_not_establish_truth_of_inference() -> None:
    capture = "22222222-2222-4222-8222-222222222222"
    source = "I spoke about the weather."
    narrative = {"schemaVersion": VERSION, "status": "READY",
        "sections": {section: ([{"text": "You are secretly afraid of tomorrow.",
            "sourceSpans": [{"captureId": capture, "start": 0, "end": len(source), "quote": source}]}]
            if section == "overview" else []) for section in SECTIONS}}
    # The program can verify quotation, not semantic entailment. This must be
    # caught in human evaluation and in producer instructions.
    assert validate_narrative(narrative, {capture: source})


def test_short_transcripts_abstain_without_contacting_model() -> None:
    class Fake(ReflectionService):
        def db(self, method, table, *, params=None, payload=None):  # type: ignore[override]
            if method == "POST":
                assert table == "reflection_results_v2" and payload["status"] == "UNRESOLVED"
                return [{"id": "saved", "status": "UNRESOLVED"}]
            if table == "scan_sessions":
                return [{"user_id": "owner", "lifecycle_state": "finalized", "transcription_consent": True,
                         "transcription_consent_version": "transcript-reflection-v1"}]
            if table == "reflection_results_v2":
                return []
            if table == "voice_reflection_consents":
                return [{"scan_id": "scan"}]
            if table == "semantic_result_records":
                return [{"status": "unresolved_abstained", "measurement_record_id": "m"}]
            if table == "measurement_records":
                return [{"measurement_status": "qualified", "quality_summary": {"warnings": [], "rejectionReasons": []}}]
            if table == "scan_prompt_captures":
                return [{"id": str(i), "prompt_order": i} for i in range(1, 4)]
            if table == "capture_transcripts":
                return [{"capture_id": str(i), "text": "A few words."} for i in range(1, 4)]
            raise AssertionError(table)

    service = Fake("https://example.test", ServiceAuth("test"), "unused")
    assert service.process("scan", "semantic") == {"status": "UNRESOLVED", "id": "saved"}
