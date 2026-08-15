from __future__ import annotations

import re

PROMPT_IDS = ("P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT")
_SAFE_SEGMENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")


def safe_object_path(scan_id: str, capture_id: str, prompt_id: str) -> str:
    if prompt_id not in PROMPT_IDS:
        raise ValueError("UNKNOWN_PROMPT_ID")
    scan_segment = _safe_segment(scan_id, "scan_id")
    capture_segment = _safe_segment(capture_id, "capture_id")
    return f"{scan_segment}/{prompt_id}_{capture_segment}.wav"


def validate_object_path(object_path: str) -> str:
    parts = object_path.split("/")
    if len(parts) != 2:
        raise ValueError("UNSAFE_STORAGE_PATH")
    _safe_segment(parts[0], "scan_id")
    filename = parts[1]
    if filename.startswith(".") or "\\" in filename or ".." in filename:
        raise ValueError("UNSAFE_STORAGE_PATH")
    if not filename.endswith(".wav"):
        raise ValueError("UNSAFE_STORAGE_PATH")
    stem = filename[:-4]
    if "_" not in stem:
        raise ValueError("UNSAFE_STORAGE_PATH")
    prompt_id, capture_id = stem.rsplit("_", 1)
    if prompt_id not in PROMPT_IDS:
        raise ValueError("UNSAFE_STORAGE_PATH")
    _safe_segment(capture_id, "capture_id")
    return object_path


def _safe_segment(value: str, field_name: str) -> str:
    if not _SAFE_SEGMENT.fullmatch(value):
        raise ValueError(f"UNSAFE_{field_name.upper()}")
    return value
