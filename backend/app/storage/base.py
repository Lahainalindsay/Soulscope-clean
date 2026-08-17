from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol


@dataclass(frozen=True)
class StoredAudio:
    path: Path
    storage_bucket: str
    storage_object_path: str
    byte_size: int
    checksum_sha256: str
    mime_type: str = "audio/wav"


class PrivateAudioStorage(Protocol):
    def store_canonical_wav(
        self,
        source_path: Path,
        scan_id: str,
        capture_id: str,
        prompt_id: str,
    ) -> StoredAudio: ...

    def delete(self, object_path: str) -> bool: ...
