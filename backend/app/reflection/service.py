from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

import httpx

from ..auth import ServiceAuth
from .voice import VOICE_CONSENT_VERSION, VOICE_MODEL, listen, load_recordings

logger = logging.getLogger(__name__)

PROMPTS = ("P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT")
SECTIONS = ("overview", "cognition", "relationships", "expression", "question")
VERSION = "reflection-narrative.v2"
CONSENT_VERSION = "transcript-reflection-v1"


def validate_narrative(narrative: Any, transcripts: dict[str, str], voice: dict[str, Any] | None = None) -> bool:
    """Verify exact character spans and output shape. Entailment still needs human evaluation."""
    if not isinstance(narrative, dict) or narrative.get("schemaVersion") != VERSION or narrative.get("status") != "READY":
        return False
    sections = narrative.get("sections")
    if not isinstance(sections, dict) or set(sections) != set(SECTIONS):
        return False
    for name in SECTIONS:
        sentences = sections[name]
        if not isinstance(sentences, list) or len(sentences) > 5 or (name == "overview" and not sentences) or (name == "question" and len(sentences) > 1):
            return False
        for sentence in sentences:
            expected = {"text", "sourceSpans", "audioRefs"} if voice else {"text", "sourceSpans"}
            if not isinstance(sentence, dict) or set(sentence) != expected:
                return False
            text, spans = sentence["text"], sentence["sourceSpans"]
            refs = sentence.get("audioRefs", [])
            if not isinstance(text, str) or not 8 <= len(text) <= 500 or not isinstance(spans, list) or len(spans) > 4:
                return False
            if not isinstance(refs, list) or len(refs) > 4 or not (spans or refs):
                return False
            known = {o["id"] for o in voice["observations"]} if voice else set()
            if any(not isinstance(ref, str) or ref not in known for ref in refs):
                return False
            if voice and name in ("cognition", "relationships") and not spans:
                return False
            if re.search(r"\b(diagnos(?:is|ed)|you have (?:adhd|ptsd|depression)|your voice proves|deep down you)\b", text, re.IGNORECASE):
                return False
            for span in spans:
                if not isinstance(span, dict) or set(span) != {"captureId", "start", "end", "quote"}:
                    return False
                source = transcripts.get(span["captureId"])
                a, b, quote = span["start"], span["end"], span["quote"]
                if source is None or type(a) is not int or type(b) is not int or not 0 <= a < b <= len(source) or not isinstance(quote, str) or source[a:b] != quote:
                    return False
    if voice and not any(line.get("audioRefs") for line in sections["overview"]):
        return False
    return not (voice and sections["expression"] and not any(line.get("audioRefs") for line in sections["expression"]))


def align_source_spans(draft: Any, transcripts: dict[str, str]) -> dict[str, Any] | None:
    """Turn exact model-selected quotes into deterministic codepoint offsets."""
    if not isinstance(draft, dict) or not isinstance(draft.get("sections"), dict):
        return None
    for lines in draft["sections"].values():
        if not isinstance(lines, list):
            return None
        for line in lines:
            if not isinstance(line, dict) or not isinstance(line.get("sourceSpans"), list):
                return None
            for span in line["sourceSpans"]:
                if not isinstance(span, dict):
                    return None
                source = transcripts.get(span.get("captureId"))
                quote = span.get("quote")
                if not source or not isinstance(quote, str) or len(quote) < 4:
                    return None
                start = source.find(quote)
                if start < 0:
                    return None
                span["start"], span["end"] = start, start + len(quote)
    return draft


def model_schema(with_voice: bool = False) -> dict[str, Any]:
    span = {"type": "object", "additionalProperties": False, "required": ["captureId", "quote"],
            "properties": {"captureId": {"type": "string"}, "quote": {"type": "string"}}}
    sentence = {"type": "object", "additionalProperties": False, "required": ["text", "sourceSpans"],
                "properties": {"text": {"type": "string"}, "sourceSpans": {"type": "array", "items": span}}}
    if with_voice:
        sentence["required"].append("audioRefs")
        sentence["properties"]["audioRefs"] = {"type": "array", "items": {"type": "string"}}
    return {"type": "object", "additionalProperties": False, "required": ["schemaVersion", "status", "sections"],
            "properties": {"schemaVersion": {"type": "string", "enum": [VERSION]},
                           "status": {"type": "string", "enum": ["READY"]},
                           "sections": {"type": "object", "additionalProperties": False,
                                        "required": list(SECTIONS), "properties": {
                                            name: {"type": "array", "items": sentence} for name in SECTIONS}}}}


def voice_observations(measurement: dict[str, Any], captures: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Only directly observable quiet-audio proportions; no emotion mapping."""
    prompts = measurement.get("prompt_measurements")
    if not isinstance(prompts, list) or len(prompts) != 3 or len(captures) != 3:
        return []
    result = []
    for i, capture in enumerate(captures):
        record = next((p for p in prompts if isinstance(p, dict)
                       and p.get("captureId") == capture.get("id") and p.get("promptId") == PROMPTS[i]), None)
        if not record or not isinstance(record.get("measurements"), list):
            return []
        entries = [v for v in record["measurements"] if isinstance(v, dict)
                   and v.get("feature_id") == "SS_PAUSE_LOAD" and v.get("quality") == "descriptive"
                   and v.get("method") == "energy_vad_silence_ratio"
                   and v.get("source_capture_id") == capture.get("id")
                   and v.get("capture_kind") == PROMPTS[i]
                   and type(v.get("value")) in (int, float) and 0 <= v["value"] <= 1]
        if len(entries) != 1:
            return []
        result.append({"captureId": str(capture["id"]), "prompt": PROMPTS[i],
                       "quietShare": entries[0]["value"]})
    return result


@dataclass(frozen=True)
class ReflectionService:
    supabase_url: str
    auth: ServiceAuth
    api_key: str
    transcription_model: str = "gpt-4o-mini-transcribe"
    narrative_model: str = "gpt-4o"

    @classmethod
    def configured(cls, supabase_url: str, auth: ServiceAuth) -> ReflectionService | None:
        key = os.environ.get("OPENAI_API", "")
        return cls(supabase_url, auth, key) if key else None

    def available(self) -> bool:
        try:
            with httpx.Client(timeout=4) as client:
                response = client.get(f"https://api.openai.com/v1/models/{VOICE_MODEL}",
                    headers={"Authorization": f"Bearer {self.api_key}"})
            return response.is_success
        except httpx.HTTPError:
            return False

    def db(self, method: str, table: str, *, params: dict[str, str] | None = None,
           payload: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        headers = {**self.auth.headers(), "Prefer": "return=representation"}
        with httpx.Client(timeout=30) as client:
            response = client.request(method, f"{self.supabase_url}/rest/v1/{table}",
                                      params=params, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            return result if isinstance(result, list) else [result]

    def consent(self, scan_id: str) -> dict[str, Any] | None:
        rows = self.db("GET", "scan_sessions", params={"id": f"eq.{scan_id}",
            "select": "id,user_id,lifecycle_state,transcription_consent,transcription_consent_version"})
        row = rows[0] if len(rows) == 1 else None
        return row if row and row["transcription_consent"] is True and row["transcription_consent_version"] == CONSENT_VERSION else None

    def transcribe_capture(self, scan_id: str, capture_id: str, path: Path) -> None:
        scan = self.consent(scan_id)
        if not scan:
            return
        existing = self.db("GET", "capture_transcripts", params={"capture_id": f"eq.{capture_id}", "select": "id"})
        if existing:
            return
        with path.open("rb") as audio, httpx.Client(timeout=60) as client:
            response = client.post("https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                data={"model": self.transcription_model, "response_format": "json"},
                files={"file": ("capture.wav", audio, "audio/wav")})
            response.raise_for_status()
            raw_text = response.json().get("text", "")
        if not isinstance(raw_text, str):
            raise TypeError("TRANSCRIPT_INVALID")
        text = raw_text.strip()
        if len(text) > 12000:
            raise ValueError("TRANSCRIPT_INVALID")
        self.db("POST", "capture_transcripts", payload={"scan_id": scan_id, "capture_id": capture_id,
            "user_id": scan["user_id"], "text": text, "provider": "openai", "model_version": self.transcription_model})

    def process(self, scan_id: str, semantic_id: str) -> dict[str, str]:
        scan = self.consent(scan_id)
        if not scan:
            return {"status": "NOT_CONSENTED"}
        existing = self.db("GET", "reflection_results_v2", params={"scan_id": f"eq.{scan_id}", "select": "id,status"})
        if existing:
            return {"status": existing[0]["status"], "id": existing[0]["id"]}
        semantic = self.db("GET", "semantic_result_records", params={"id": f"eq.{semantic_id}",
            "scan_id": f"eq.{scan_id}", "select": "id,status,measurement_record_id"})
        if len(semantic) != 1 or semantic[0]["status"] != "unresolved_abstained" or scan["lifecycle_state"] != "finalized":
            return {"status": "NOT_ELIGIBLE"}
        measurements = self.db("GET", "measurement_records", params={"id": f"eq.{semantic[0]['measurement_record_id']}",
            "select": "measurement_status,quality_summary,prompt_measurements"})
        quality = measurements[0] if len(measurements) == 1 else {}
        summary = quality.get("quality_summary") or {}
        rows = self.db("GET", "capture_transcripts", params={"scan_id": f"eq.{scan_id}",
            "select": "capture_id,text"})
        captures = self.db("GET", "scan_prompt_captures", params={"scan_id": f"eq.{scan_id}",
            "select": "id,prompt_order", "order": "prompt_order.asc"})
        transcripts = {str(r["capture_id"]): str(r["text"]) for r in rows}
        valid_ids = len(captures) == 3 and len(rows) == 3 and {str(c["id"]) for c in captures} == set(transcripts)
        voice = voice_observations(quality, captures)
        consent_rows = self.db("GET", "voice_reflection_consents", params={"scan_id": f"eq.{scan_id}",
            "version": f"eq.{VOICE_CONSENT_VERSION}", "select": "scan_id"})
        if not consent_rows:
            return {"status": "VOICE_CONSENT_REQUIRED"}
        voice_record = None
        recordings = None
        if not valid_ids and quality.get("measurement_status") == "qualified" and not summary.get("warnings") and not summary.get("rejectionReasons"):
            artifacts = self.db("GET", "capture_artifacts", params={"scan_id": f"eq.{scan_id}", "select": "*"})
            recordings = load_recordings(self.supabase_url, self.auth.headers(), scan_id, captures, artifacts)
            for recording in recordings:
                if recording["captureId"] not in transcripts:
                    with NamedTemporaryFile(suffix=".wav") as audio:
                        audio.write(recording["bytes"])
                        audio.flush()
                        self.transcribe_capture(scan_id, recording["captureId"], Path(audio.name))
            rows = self.db("GET", "capture_transcripts", params={"scan_id": f"eq.{scan_id}", "select": "capture_id,text"})
            transcripts = {str(r["capture_id"]): str(r["text"]) for r in rows}
            valid_ids = len(captures) == 3 and len(rows) == 3 and {str(c["id"]) for c in captures} == set(transcripts)
            if not valid_ids:
                return {"status": "TRANSCRIPTION_UNAVAILABLE"}
        if quality.get("measurement_status") != "qualified" or summary.get("warnings") or summary.get("rejectionReasons") or not valid_ids or sum(len(t.split()) for t in transcripts.values()) < 30:
            narrative: dict[str, Any] = {"schemaVersion": VERSION, "status": "UNRESOLVED",
                "reason": "INSUFFICIENT_SPEECH_OR_QUALITY", "sections": {name: [] for name in SECTIONS}}
        else:
            saved_voice = self.db("GET", "voice_observation_records", params={"scan_id": f"eq.{scan_id}", "select": "*"})
            if saved_voice:
                voice_record = saved_voice[0]
            else:
                if recordings is None:
                    artifacts = self.db("GET", "capture_artifacts", params={"scan_id": f"eq.{scan_id}", "select": "*"})
                    recordings = load_recordings(self.supabase_url, self.auth.headers(), scan_id, captures, artifacts)
                heard = listen(self.api_key, recordings, voice)
                try:
                    voice_record = self.db("POST", "voice_observation_records", payload={
                        "scan_id": scan_id, "user_id": scan["user_id"], **heard})[0]
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code != 409:
                        raise
                    voice_record = self.db("GET", "voice_observation_records", params={
                        "scan_id": f"eq.{scan_id}", "select": "*"})[0]
            ordered = [{"captureId": str(c["id"]), "prompt": PROMPTS[i], "text": transcripts[str(c["id"])]}
                       for i, c in enumerate(captures)]
            instructions = ("Write a coherent, personal, nonclinical reflection using direct listening observations AND the spoken words. "
                "The listening stage actually heard the audio. Its delivery observations and tentative impressions are perceptual, "
                "not validated measurements of the speaker's actual emotions. Use a warm, precise second-person voice. "
                "Each sentence must cite audioRefs (provided voice observation IDs), sourceSpans (exact transcript quotes), or both. "
                "Give each sentence both arrays; unused arrays are empty. Provide captureId and exact quote for word citations; "
                "the server finds offsets. Overview MUST cite voice evidence. Expression, when present, MUST cite voice evidence. "
                "Cognition and relationships require transcript quotes; sound cannot establish thoughts or relational behavior. "
                "Do not infer thoughts or relationships from pitch, silence, or the prompt category. Do not invent circumstances, "
                "past events, feelings, plans, or other people's intentions. Omit unsupported sections by returning an empty array. "
                "Overview is required, two to four specific sentences: how the person sounds, the tension or contrast across "
                "responses if audible, and how that relates cautiously to what they chose to share. Write 'you sound' or "
                "'your delivery comes across as' for vocal impressions; do not assert inner truth. No generic flattery or score phrases. "
                "Cognition describes "
                "the speaker's expressed thinking; relationships only if they discussed people; expression describes audible "
                "delivery and, when supported by words, what they are communicating outwardly. Question may be empty or one open question. "
                "A citation proves wording was present, not that a psychological interpretation is true; prefer qualified wording. "
                "The separate voice observations measure quiet audio in each full recording, including pauses and microphone effects. "
                "They cannot establish emotion. You may refer to a change in audible quiet across responses only when the values differ, "
                "and must never attribute a mental cause to that change.")
            messages = [
                {"role": "system", "content": instructions},
                {"role": "user", "content": json.dumps({"transcripts": ordered,
                    "listeningObservations": voice_record["observations"], "acousticContext": voice}, ensure_ascii=False)},
            ]
            narrative = None
            with httpx.Client(timeout=90) as client:
                for attempt in range(3):
                    response = client.post("https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={"model": self.narrative_model, "messages": messages,
                            "response_format": {"type": "json_schema", "json_schema": {
                                "name": "soulscope_reflection_v2", "strict": True, "schema": model_schema(with_voice=True)}}, "store": False})
                    response.raise_for_status()
                    draft = json.loads(response.json()["choices"][0]["message"]["content"])
                    narrative = align_source_spans(draft, transcripts)
                    if validate_narrative(narrative, transcripts, voice_record):
                        break
                    if attempt < 2:
                        messages.append({"role": "assistant", "content": json.dumps(draft, ensure_ascii=False)})
                        messages.append({"role": "user", "content": (
                            "That draft failed exact-source validation. Rewrite the entire reading. Every quote must "
                            "be a contiguous, character-for-character substring of the transcript for its captureId; "
                            "copy it exactly, including punctuation and casing. Use one short quote per sentence. "
                            "Keep each section at most five sentences, the question at most one, and overview nonempty. "
                            "Each sentence must be 8 to 500 characters. Remove any claim you cannot ground in exact words."
                            " Voice-backed sentences may instead use an empty sourceSpans array with valid audioRefs. "
                            "Overview and any expression section must cite audioRefs. Do not add start/end offsets yourself."
                        )})
            if not validate_narrative(narrative, transcripts, voice_record):
                logger.warning("reflection_source_validation_failed scan_id=%s", scan_id)
                return {"status": "VALIDATION_FAILED"}
            narrative["mode"] = "VOICE_AND_WORDS"
            narrative["voiceRecordId"] = voice_record["id"]
        try:
            saved = self.db("POST", "reflection_results_v2", payload={"scan_id": scan_id,
                "semantic_result_id": semantic_id, "user_id": scan["user_id"],
                "status": narrative["status"], "narrative": narrative, "model_version": self.narrative_model})
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code != 409:
                raise
            saved = self.db("GET", "reflection_results_v2", params={"scan_id": f"eq.{scan_id}", "select": "id,status"})
        logger.info("reflection_saved scan_id=%s status=%s", scan_id, saved[0]["status"])
        return {"status": saved[0]["status"], "id": str(saved[0]["id"])}
