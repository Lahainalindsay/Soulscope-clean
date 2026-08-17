from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path


@dataclass(frozen=True)
class CleanupResult:
    deleted_paths: tuple[Path, ...]
    retained_paths: tuple[Path, ...]


def cleanup_expired_private_audio(root: Path, older_than_hours: int = 24) -> CleanupResult:
    if not root.exists():
        return CleanupResult((), ())

    cutoff = datetime.now(UTC) - timedelta(hours=older_than_hours)
    deleted: list[Path] = []
    retained: list[Path] = []
    for path in root.rglob("*.wav"):
        modified = datetime.fromtimestamp(path.stat().st_mtime, tz=UTC)
        if modified < cutoff:
            path.unlink()
            deleted.append(path)
        else:
            retained.append(path)
    return CleanupResult(tuple(deleted), tuple(retained))
