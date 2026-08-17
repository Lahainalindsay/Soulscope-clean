from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from typing import Self
from unittest.mock import patch
from urllib.error import HTTPError

from app.auth import ServiceAuth
from app.config import Settings
from app.storage.paths import safe_object_path, validate_object_path
from app.storage.supabase import SupabaseObjectMissingError, SupabasePrivateAudioStorage

from .support import fixture_path


class _Response:
    def __init__(self, body: bytes) -> None:
        self.body = body

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self) -> bytes:
        return self.body


class SupabaseStorageTests(unittest.TestCase):
    def settings(self, root: Path) -> Settings:
        return Settings(
            supabase_url="https://example.supabase.co",
            supabase_service_role_key="service-role",
            private_audio_root=root,
            storage_backend="supabase",
            private_audio_bucket="private-audio-test",
        )

    def test_safe_paths_reject_traversal_and_urls(self) -> None:
        self.assertEqual(
            safe_object_path("scan_1", "capture-1", "P1_OPEN_REFERENCE"),
            "scan_1/P1_OPEN_REFERENCE_capture-1.wav",
        )

        for value in [
            "../scan/P1_OPEN_REFERENCE_capture.wav",
            "scan/../P1_OPEN_REFERENCE_capture.wav",
            "scan/http://signed.wav",
            "scan/P1_OPEN_REFERENCE_capture.wav?token=secret",
            "scan/P4_UNKNOWN_capture.wav",
        ]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate_object_path(value)

    def test_private_bucket_check_rejects_public_bucket(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            storage = SupabasePrivateAudioStorage(
                self.settings(Path(tmp)),
                ServiceAuth("service-role"),
            )
            with patch("app.storage.supabase.urlopen", return_value=_Response(b'{"public": true}')), (
                self.assertRaisesRegex(RuntimeError, "AUDIO_BUCKET_MUST_BE_PRIVATE")
            ):
                storage.ensure_private_bucket()

    def test_upload_download_delete_use_authenticated_storage_api_without_public_urls(self) -> None:
        calls = []
        wav_body = fixture_path("P1_OPEN_REFERENCE.wav").read_bytes()

        def fake_urlopen(request: object, timeout: float = 0) -> _Response:
            calls.append((request, timeout))
            method = request.get_method()  # type: ignore[attr-defined]
            url = request.full_url  # type: ignore[attr-defined]
            if method == "GET" and "/bucket/private-audio-test" in url:
                return _Response(b'{"id":"private-audio-test","public":false}')
            if method == "POST" and "/storage/v1/object/private-audio-test/" in url:
                return _Response(b'{"Key":"private-audio-test/scan/P1_OPEN_REFERENCE_capture.wav"}')
            if method == "GET" and "/storage/v1/object/authenticated/private-audio-test/" in url:
                return _Response(wav_body)
            if method == "DELETE" and url.endswith("/storage/v1/object/private-audio-test"):
                body = json.loads(request.data.decode("utf-8"))  # type: ignore[union-attr]
                self.assertEqual(body, {"prefixes": ["scan/P1_OPEN_REFERENCE_capture.wav"]})
                return _Response(b"[]")
            raise AssertionError(f"unexpected request {method} {url}")

        with tempfile.TemporaryDirectory() as tmp:
            storage = SupabasePrivateAudioStorage(
                self.settings(Path(tmp)),
                ServiceAuth("service-role"),
            )
            with patch("app.storage.supabase.urlopen", side_effect=fake_urlopen):
                storage.ensure_private_bucket()
                stored = storage.store_canonical_wav(
                    fixture_path("P1_OPEN_REFERENCE.wav"),
                    "scan",
                    "capture",
                    "P1_OPEN_REFERENCE",
                )
                deleted = storage.delete("scan/P1_OPEN_REFERENCE_capture.wav")

            self.assertTrue(deleted)
            self.assertEqual(stored.storage_bucket, "private-audio-test")
            self.assertEqual(stored.storage_object_path, "scan/P1_OPEN_REFERENCE_capture.wav")
            self.assertTrue(stored.path.exists())
        urls = [request.full_url for request, _timeout in calls]  # type: ignore[attr-defined]
        self.assertFalse(any("/object/public/" in url for url in urls))
        headers = [request.headers for request, _timeout in calls]  # type: ignore[attr-defined]
        self.assertTrue(all("Authorization" in header for header in headers))

    def test_missing_download_is_distinct(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            storage = SupabasePrivateAudioStorage(
                self.settings(Path(tmp)),
                ServiceAuth("service-role"),
            )
            error = HTTPError(
                "https://example.supabase.co/storage/v1/object/authenticated/x",
                404,
                "not found",
                {},
                None,
            )
            with patch("app.storage.supabase.urlopen", side_effect=error), self.assertRaises(
                SupabaseObjectMissingError
            ):
                storage.download_bytes("scan/P1_OPEN_REFERENCE_capture.wav")


if __name__ == "__main__":
    unittest.main()
