from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx

from ..auth import ServiceAuth

PROMPTS = ("P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT")
SECTIONS = ("overview", "cognition", "relationships", "expression", "question")
VERSION = "reflection-narrative.v2"
CONSENT_VERSION = "transcript-reflection-v1"


def validate_narrative(narrative: Any, transcripts: dict[str, str]) -> bool:
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
            if not isinstance(sentence, dict) or set(sentence) != {"text", "sourceSpans"}:
                return False
            text, spans = sentence["text"], sentence["sourceSpans"]
            if not isinstance(text, str) or not 8 <= len(text) <= 500 or not isinstance(spans, list) or not spans or len(spans) > 4:
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
    return True


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


def model_schema() -> dict[str, Any]:
    span = {"type": "object", "additionalProperties": False, "required": ["captureId", "quote"],
            "properties": {"captureId": {"type": "string"}, "quote": {"type": "string"}}}
    sentence = {"type": "object", "additionalProperties": False, "required": ["text", "sourceSpans"],
                "properties": {"text": {"type": "string"}, "sourceSpans": {"type": "array", "items": span}}}
    return {"type": "object", "additionalProperties": False, "required": ["schemaVersion", "status", "sections"],
            "properties": {"schemaVersion": {"type": "string", "enum": [VERSION]},
                           "status": {"type": "string", "enum": ["READY"]},
                           "sections": {"type": "object", "additionalProperties": False,
                                        "required": list(SECTIONS), "properties": {
                                            name: {"type": "array", "items": sentence} for name in SECTIONS}}}}


@dataclass(frozen=True)
class ReflectionService:
    supabase_url: str
    auth: ServiceAuth
    api_key: str
    transcription_model: str = "gpt-4o-mini-transcribe"
    narrative_model: str = "gpt-4o"

    @classmethod
    def configured(cls, supabase_url: str, auth: ServiceAuth) -> ReflectionService | None:
        key = os.environ.get("OPENAI_API_KEY", "")
        return cls(supabase_url, auth, key) if key else None

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
            "select": "measurement_status,quality_summary"})
        quality = measurements[0] if len(measurements) == 1 else {}
        summary = quality.get("quality_summary") or {}
        rows = self.db("GET", "capture_transcripts", params={"scan_id": f"eq.{scan_id}",
            "select": "capture_id,text"})
        captures = self.db("GET", "scan_prompt_captures", params={"scan_id": f"eq.{scan_id}",
            "select": "id,prompt_order", "order": "prompt_order.asc"})
        transcripts = {str(r["capture_id"]): str(r["text"]) for r in rows}
        valid_ids = len(captures) == 3 and len(rows) == 3 and {str(c["id"]) for c in captures} == set(transcripts)
        if quality.get("measurement_status") != "qualified" or summary.get("warnings") or summary.get("rejectionReasons") or not valid_ids or sum(len(t.split()) for t in transcripts.values()) < 30:
            narrative: dict[str, Any] = {"schemaVersion": VERSION, "status": "UNRESOLVED",
                "reason": "INSUFFICIENT_SPEECH_OR_QUALITY", "sections": {name: [] for name in SECTIONS}}
        else:
            ordered = [{"captureId": str(c["id"]), "prompt": PROMPTS[i], "text": transcripts[str(c["id"])]}
                       for i, c in enumerate(captures)]
            instructions = ("Write a personal, nonclinical present-moment reflection from what the speaker actually says. "
                "Use second person and a warm, specific voice. Each sentence must cite one or more short exact verbatim "
                "quotes from the supplied transcript. Provide the captureId and exact quote; the server will find offsets. "
                "Do not infer thoughts or relationships from pitch, silence, or the prompt category. Do not invent circumstances, "
                "past events, feelings, plans, or other people's intentions. Omit unsupported sections by returning an empty array. "
                "Overview is required and should capture the overall moment, not a generic compliment. Cognition describes "
                "the speaker's expressed thinking; relationships only if they discussed people; expression only what they "
                "said they are communicating or doing outwardly. Question may be empty or one open question. "
                "A citation proves wording was present, not that a psychological interpretation is true; prefer qualified wording.")
            with httpx.Client(timeout=90) as client:
                response = client.post("https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"model": self.narrative_model, "messages": [
                        {"role": "system", "content": instructions},
                        {"role": "user", "content": json.dumps({"transcripts": ordered}, ensure_ascii=False)}],
                        "response_format": {"type": "json_schema", "json_schema": {
                            "name": "soulscope_reflection_v2", "strict": True, "schema": model_schema()}}})
                response.raise_for_status()
                draft = json.loads(response.json()["choices"][0]["message"]["content"])
            narrative = align_source_spans(draft, transcripts)
            if not validate_narrative(narrative, transcripts):
                return {"status": "VALIDATION_FAILED"}
        saved = self.db("POST", "reflection_results_v2", payload={"scan_id": scan_id,
            "semantic_result_id": semantic_id, "user_id": scan["user_id"],
            "status": narrative["status"], "narrative": narrative, "model_version": self.narrative_model})
        return {"status": narrative["status"], "id": str(saved[0]["id"])}
