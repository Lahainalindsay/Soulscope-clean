from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from ..auth import ServiceAuth
from ..config import Settings
from .base import StoredAudio
from .local import validate_wav
from .paths import safe_object_path, validate_object_path


class SupabaseStorageError(RuntimeError):
    def __init__(self, operation: str, status_code: int | None, reason: str) -> None:
        self.operation = operation
        self.status_code = status_code
        super().__init__(f"Supabase Storage {operation} failed: {status_code or 'n/a'} {reason}")


class SupabaseObjectMissingError(SupabaseStorageError):
    def __init__(self, operation: str, object_path: str) -> None:
        self.object_path = object_path
        super().__init__(operation, 404, "OBJECT_NOT_FOUND")


@dataclass(frozen=True)
class SupabasePrivateAudioStorage:
    settings: Settings
    auth: ServiceAuth
    timeout_seconds: float = 30.0

    def __post_init__(self) -> None:
        if not self.settings.supabase_url:
            raise RuntimeError("SUPABASE_URL is required for Supabase storage")
        if not self.settings.private_audio_bucket:
            raise RuntimeError("SOULSCOPE_SUPABASE_STORAGE_BUCKET is required")

    def ensure_private_bucket(self) -> None:
        data = self._request_json("bucket_lookup", "GET", f"bucket/{self.settings.private_audio_bucket}")
        if bool(data.get("public")):
            raise SupabaseStorageError("bucket_lookup", 403, "AUDIO_BUCKET_MUST_BE_PRIVATE")

    def store_canonical_wav(
        self,
        source_path: Path,
        scan_id: str,
        capture_id: str,
        prompt_id: str,
    ) -> StoredAudio:
        validate_wav(source_path, self.settings)
        object_path = safe_object_path(scan_id, capture_id, prompt_id)
        body = source_path.read_bytes()
        digest = hashlib.sha256(body).hexdigest()
        self.upload_bytes(object_path, body, "audio/wav")
        cached_path = self.download_to_private_cache(object_path)
        return StoredAudio(
            path=cached_path,
            storage_bucket=self.settings.private_audio_bucket,
            storage_object_path=object_path,
            byte_size=len(body),
            checksum_sha256=digest,
        )

    def upload_bytes(self, object_path: str, body: bytes, content_type: str) -> None:
        safe_path = validate_object_path(object_path)
        self._request_bytes(
            "upload",
            "POST",
            f"object/{self.settings.private_audio_bucket}/{_quote_path(safe_path)}",
            body=body,
            extra_headers={"content-type": content_type, "x-upsert": "true"},
        )

    def download_to_private_cache(self, object_path: str) -> Path:
        safe_path = validate_object_path(object_path)
        body = self.download_bytes(safe_path)
        target_path = self.settings.private_audio_root / "supabase-cache" / safe_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = target_path.with_suffix(".wav.tmp")
        temporary_path.write_bytes(body)
        temporary_path.replace(target_path)
        return target_path

    def download_bytes(self, object_path: str) -> bytes:
        safe_path = validate_object_path(object_path)
        return self._request_bytes(
            "download",
            "GET",
            f"object/authenticated/{self.settings.private_audio_bucket}/{_quote_path(safe_path)}",
        )

    def delete(self, object_path: str) -> bool:
        safe_path = validate_object_path(object_path)
        try:
            self._request_json(
                "delete",
                "DELETE",
                f"object/{self.settings.private_audio_bucket}",
                body=json.dumps({"prefixes": [safe_path]}).encode("utf-8"),
                extra_headers={"content-type": "application/json"},
            )
        except SupabaseObjectMissingError:
            return False
        return True

    def _request_json(
        self,
        operation: str,
        method: str,
        route: str,
        body: bytes | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> dict[str, object]:
        response = self._request_bytes(operation, method, route, body, extra_headers)
        if not response:
            return {}
        data = json.loads(response.decode("utf-8"))
        if isinstance(data, dict):
            return data
        return {"items": data}

    def _request_bytes(
        self,
        operation: str,
        method: str,
        route: str,
        body: bytes | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> bytes:
        headers = self.auth.headers()
        if extra_headers:
            headers.update(extra_headers)
        url = f"{self.settings.supabase_url}/storage/v1/{route}"
        request = Request(url, data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                return response.read()
        except HTTPError as exc:
            raw_detail = exc.read()
            if isinstance(raw_detail, bytes):
                detail = raw_detail.decode("utf-8", errors="replace")
            else:
                detail = str(raw_detail)
            reason = _safe_error_reason(detail)
            if exc.code == 404:
                raise SupabaseObjectMissingError(operation, route) from exc
            raise SupabaseStorageError(operation, exc.code, reason) from exc


def _quote_path(value: str) -> str:
    return "/".join(quote(part, safe="") for part in value.split("/"))


def _safe_error_reason(detail: str) -> str:
    lowered = detail.lower()
    if "not found" in lowered or "does not exist" in lowered:
        return "NOT_FOUND"
    if "permission" in lowered or "unauthorized" in lowered or "forbidden" in lowered:
        return "PERMISSION_DENIED"
    if "bucket" in lowered and "public" in lowered:
        return "BUCKET_POLICY_ERROR"
    return "STORAGE_ERROR"
