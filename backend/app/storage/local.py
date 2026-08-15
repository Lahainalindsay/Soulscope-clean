from __future__ import annotations

import hashlib
import shutil
import wave
from dataclasses import dataclass
from pathlib import Path

from ..config import Settings
from .base import StoredAudio
from .paths import PROMPT_IDS, safe_object_path, validate_object_path


def validate_wav(path: Path, settings: Settings) -> None:
    if not path.exists():
        raise ValueError("audio file does not exist")
    byte_size = path.stat().st_size
    if byte_size > settings.max_upload_bytes:
        raise ValueError("OVERSIZED_UPLOAD")

    try:
        with wave.open(str(path), "rb") as wav:
            if wav.getsampwidth() != 2:
                raise ValueError("INVALID_WAV_SAMPLE_WIDTH")
            if wav.getframerate() <= 0 or wav.getnframes() <= 0:
                raise ValueError("ZERO_DURATION_WAV")
            duration = wav.getnframes() / wav.getframerate()
            if duration <= 0:
                raise ValueError("ZERO_DURATION_WAV")
            if duration > settings.max_duration_seconds:
                raise ValueError("DURATION_EXCEEDS_90_SECONDS")
            expected_bytes = wav.getnframes() * wav.getnchannels() * wav.getsampwidth()
            actual_audio_bytes = byte_size - 44
            if actual_audio_bytes > 0 and actual_audio_bytes < expected_bytes:
                raise ValueError("TRUNCATED_WAV")
    except wave.Error as exc:
        raise ValueError("INVALID_WAV") from exc


@dataclass(frozen=True)
class LocalPrivateAudioStorage:
    settings: Settings

    def store_canonical_wav(
        self,
        source_path: Path,
        scan_id: str,
        capture_id: str,
        prompt_id: str,
    ) -> StoredAudio:
        if prompt_id not in PROMPT_IDS:
            raise ValueError("UNKNOWN_PROMPT_ID")
        validate_wav(source_path, self.settings)

        object_path = safe_object_path(scan_id, capture_id, prompt_id)
        target_path = self.settings.private_audio_root / object_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = target_path.with_suffix(".wav.tmp")
        shutil.copyfile(source_path, temporary_path)
        temporary_path.replace(target_path)

        digest = hashlib.sha256(target_path.read_bytes()).hexdigest()
        return StoredAudio(
            path=target_path,
            storage_bucket=self.settings.private_audio_bucket,
            storage_object_path=object_path,
            byte_size=target_path.stat().st_size,
            checksum_sha256=digest,
        )

    def delete(self, object_path: str) -> bool:
        safe_path = self.settings.private_audio_root / validate_object_path(object_path)
        if not safe_path.exists():
            return False
        safe_path.unlink()
        return True


def store_canonical_wav(
    source_path: Path,
    settings: Settings,
    scan_id: str,
    capture_id: str,
    prompt_id: str,
) -> StoredAudio:
    return LocalPrivateAudioStorage(settings).store_canonical_wav(
        source_path,
        scan_id,
        capture_id,
        prompt_id,
    )
