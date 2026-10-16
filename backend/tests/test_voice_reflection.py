from __future__ import annotations

import base64
import hashlib
import io
import json
import wave

import httpx
import pytest

from app.auth import ServiceAuth
from app.reflection import voice
from app.reflection.service import SECTIONS, VERSION, ReflectionService, validate_narrative


def audio_bytes() -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(b"\x00\x00" * (16000 * 30))
    return output.getvalue()


def test_direct_listener_sends_actual_audio_and_keeps_capture_provenance(monkeypatch) -> None:
    body = audio_bytes()
    recordings = [{"captureId": str(i), "artifactId": f"artifact-{i}",
                   "checksumSha256": hashlib.sha256(body).hexdigest(), "durationMs": 30000,
                   "prompt": str(i), "bytes": body} for i in range(3)]
    requests = []

    def handle(request: httpx.Request) -> httpx.Response:
        data = json.loads(request.content)
        requests.append(data)
        assert data["model"] == voice.VOICE_MODEL and data["modalities"] == ["text"] and data["store"] is False
        audio = [part["input_audio"] for part in data["messages"][1]["content"] if part["type"] == "input_audio"]
        assert len(audio) == 3
        assert all(base64.b64decode(part["data"]) == body and part["format"] == "wav" for part in audio)
        draft = {"usable": True, "observations": [{"captureIds": [str(i)],
            "delivery": "Speech has audible variation in cadence.", "impression": "The delivery comes across as measured."} for i in range(3)]}
        return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps(draft)}}]})

    original = httpx.Client
    monkeypatch.setattr(voice.httpx, "Client", lambda **kwargs: original(transport=httpx.MockTransport(handle), **kwargs))
    result = voice.listen("test-key", recordings, [])
    assert len(requests) == 1 and len(result["observations"]) == 3
    assert all("bytes" not in row for row in result["source_artifacts"])


def test_listener_rejects_unknown_captures_missing_coverage_and_diagnosis() -> None:
    rows = [{"captureIds": [str(i)], "delivery": "Speech has an audible steady cadence.", "impression": ""} for i in range(3)]
    assert voice.validate_voice_draft({"usable": True, "observations": rows}, {"0", "1", "2"})
    rows[2]["captureIds"] = ["other-user-capture"]
    assert voice.validate_voice_draft({"usable": True, "observations": rows}, {"0", "1", "2"}) is None
    rows[2]["captureIds"] = ["2"]
    rows[0]["impression"] = "You have depression."
    assert voice.validate_voice_draft({"usable": True, "observations": rows}, {"0", "1", "2"}) is None
    assert voice.validate_voice_draft({"usable": False, "observations": []}, {"0", "1", "2"}) is None


def test_private_audio_read_rejects_tampered_bytes(monkeypatch) -> None:
    body = audio_bytes()
    captures = [{"id": str(i), "prompt_order": i + 1} for i in range(3)]
    prompts = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"]
    artifacts = [{"id": str(i), "scan_id": "scan", "capture_id": str(i), "audio_state": "stored_private",
                  "storage_bucket": "private-audio", "storage_object_path": f"scan/{prompts[i]}_{i}.wav",
                  "checksum_sha256": "0" * 64} for i in range(3)]
    original = httpx.Client
    monkeypatch.setattr(voice.httpx, "Client", lambda **kwargs: original(
        transport=httpx.MockTransport(lambda request: httpx.Response(200, content=body)), **kwargs))
    with pytest.raises(ValueError, match="AUDIO_CHECKSUM_MISMATCH"):
        voice.load_recordings("https://db.example", {}, "scan", captures, artifacts)


def test_voice_reading_requires_real_audio_refs_and_words_for_relational_claims() -> None:
    line = {"text": "Your delivery comes across as measured.", "sourceSpans": [], "audioRefs": ["voice-1"]}
    narrative = {"schemaVersion": VERSION, "status": "READY",
                 "sections": {name: [line] if name == "overview" else [] for name in SECTIONS}}
    heard = {"observations": [{"id": "voice-1"}]}
    assert validate_narrative(narrative, {}, heard)
    assert not validate_narrative(narrative, {})
    narrative["sections"]["relationships"] = [line]
    assert not validate_narrative(narrative, {}, heard)
    narrative["sections"]["relationships"] = []
    line["audioRefs"] = ["invented"]
    assert not validate_narrative(narrative, {}, heard)


def test_writer_retries_invalid_sources_and_resumes_saved_listening(monkeypatch) -> None:
    calls = []
    saved = []
    consented = True
    ids = ["a", "b", "c"]
    heard = {"id": "voice-record", "observations": [{"id": "voice-1",
             "captureIds": ids, "delivery": "Cadence is measured and changes across the responses.",
             "impression": "A measured delivery."}]}

    class Fake(ReflectionService):
        def db(self, method, table, *, params=None, payload=None):  # type: ignore[override]
            if method == "POST":
                assert table == "reflection_results_v2"
                saved.append(payload)
                return [{"id": "reading", "status": "READY"}]
            return {
                "scan_sessions": [{"user_id": "owner", "lifecycle_state": "finalized", "transcription_consent": True,
                                   "transcription_consent_version": "transcript-reflection-v1"}],
                "reflection_results_v2": [],
                "semantic_result_records": [{"status": "unresolved_abstained", "measurement_record_id": "m"}],
                "measurement_records": [{"measurement_status": "qualified", "quality_summary": {"warnings": [], "rejectionReasons": []}}],
                "scan_prompt_captures": [{"id": key, "prompt_order": i + 1} for i, key in enumerate(ids)],
                "capture_transcripts": [{"capture_id": key, "text": "I am looking forward to making a plan with my family this weekend."} for key in ids],
                "voice_reflection_consents": [{"scan_id": "scan"}] if consented else [],
                "voice_observation_records": [heard],
            }[table]

    def handle(request: httpx.Request) -> httpx.Response:
        data = json.loads(request.content)
        calls.append(data)
        assert "listeningObservations" in data["messages"][1]["content"]
        line = {"text": "Your delivery comes across as measured.", "sourceSpans": [],
                "audioRefs": ["invented" if len(calls) == 1 else "voice-1"]}
        draft = {"schemaVersion": VERSION, "status": "READY", "sections": {
            name: [line] if name in ("overview", "expression") else [] for name in SECTIONS}}
        return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps(draft)}}]})

    original = httpx.Client
    monkeypatch.setattr(voice.httpx, "Client", lambda **kwargs: original(transport=httpx.MockTransport(handle), **kwargs))
    service = Fake("https://db.example", ServiceAuth("test-key"), "test-key")
    assert service.process("scan", "semantic") == {"status": "READY", "id": "reading"}
    assert len(calls) == 2 and len(saved) == 1
    assert saved[0]["narrative"]["voiceRecordId"] == "voice-record"
    assert saved[0]["narrative"]["mode"] == "VOICE_AND_WORDS"
    consented = False
    assert service.process("scan", "semantic") == {"status": "VOICE_CONSENT_REQUIRED"}
    assert len(calls) == 2
