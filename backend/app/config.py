from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

EXTRACTOR_VERSION = "soulscope-measurement-worker-0.2.0"
QUALITY_RULES_VERSION = "0.1"
PROTOCOL_VERSION = "1.3"
RENDERER_REGISTRY_VERSION = "CALIBRATION_REQUIRED"
EVIDENCE_ENGINE_VERSION = "soulscope-evidence-engine-0.2.0"
EVIDENCE_RULE_VERSION = "evidence-canonical-structural-v2"
EVIDENCE_LEDGER_SCHEMA_VERSION = "0.1"
EVIDENCE_REGISTRY_VERSION = "0.1"
DIMENSION_ENGINE_VERSION = "soulscope-dimension-engine-0.2.0"
DIMENSION_RESULT_SCHEMA_VERSION = "0.1"
DIMENSION_REGISTRY_VERSION = "0.1"
DIMENSION_SCORING_VERSION = "CALIBRATION_REQUIRED"
DIMENSION_CALIBRATION_REGISTRY_VERSION = "dimension-calibration-foundation-v0.2"
DIMENSION_CALIBRATION_CONTRACT_VERSION = "0.1"


@dataclass(frozen=True)
class Settings:
    supabase_url: str
    supabase_service_role_key: str
    private_audio_root: Path
    supabase_anon_key: str = ""
    max_upload_bytes: int = 25 * 1024 * 1024
    max_duration_seconds: float = 90.0
    min_speech_ratio: float = 0.05
    silence_rms_threshold: float = 0.01
    clipping_ratio_threshold: float = 0.01
    cleanup_retry_hours: int = 24
    worker_internal_token: str | None = None
    storage_backend: str = "local"
    private_audio_bucket: str = "private-audio"
    allowed_origins: tuple[str, ...] = ("http://localhost:3000", "http://localhost:3001")

    @classmethod
    def from_env(cls) -> Settings:
        return cls(
            supabase_url=os.environ.get("SUPABASE_URL", "").rstrip("/"),
            supabase_service_role_key=os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
            supabase_anon_key=os.environ.get("SUPABASE_ANON_KEY", ""),
            private_audio_root=Path(
                os.environ.get("SOULSCOPE_PRIVATE_AUDIO_ROOT", "backend/.private_audio")
            ),
            worker_internal_token=os.environ.get("SOULSCOPE_WORKER_INTERNAL_TOKEN") or None,
            storage_backend=os.environ.get("SOULSCOPE_STORAGE_BACKEND", "local"),
            private_audio_bucket=os.environ.get(
                "SOULSCOPE_SUPABASE_STORAGE_BUCKET",
                os.environ.get("SOULSCOPE_PRIVATE_AUDIO_BUCKET", "private-audio"),
            ),
            allowed_origins=tuple(
                origin.strip()
                for origin in os.environ.get(
                    "SOULSCOPE_ALLOWED_ORIGINS",
                    "http://localhost:3000,http://localhost:3001",
                ).split(",")
                if origin.strip()
            ),
        )


def require_service_settings() -> Settings:
    settings = Settings.from_env()
    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is required")
    if not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is required")
    if not settings.supabase_anon_key:
        raise RuntimeError("SUPABASE_ANON_KEY is required")
    if settings.storage_backend not in ("local", "supabase"):
        raise RuntimeError("SOULSCOPE_STORAGE_BACKEND must be 'local' or 'supabase'")
    if settings.storage_backend == "supabase" and not settings.private_audio_bucket:
        raise RuntimeError("SOULSCOPE_SUPABASE_STORAGE_BUCKET is required for Supabase storage")
    return settings
