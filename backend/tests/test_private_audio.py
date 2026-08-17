from __future__ import annotations

import os
import tempfile
import time
import unittest
import wave
from pathlib import Path

from app.config import Settings
from app.storage.cleanup import cleanup_expired_private_audio
from app.storage.private_audio import store_canonical_wav, validate_wav

from .support import fixture_path, sine_samples, write_wav


class PrivateAudioLifecycleTests(unittest.TestCase):
    def settings(self, root: Path, **overrides: object) -> Settings:
        values = {
            "supabase_url": "http://localhost:54321",
            "supabase_service_role_key": "service-role",
            "private_audio_root": root,
        }
        values.update(overrides)
        return Settings(**values)  # type: ignore[arg-type]

    def test_store_canonical_wav_uses_private_path_and_checksum(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            settings = self.settings(Path(tmp) / "private")
            stored = store_canonical_wav(
                fixture_path("P1_OPEN_REFERENCE.wav"),
                settings,
                "scan-1",
                "capture-1",
                "P1_OPEN_REFERENCE",
            )

            self.assertTrue(stored.path.exists())
            self.assertEqual(stored.storage_bucket, "private-audio")
            self.assertEqual(stored.storage_object_path, "scan-1/P1_OPEN_REFERENCE_capture-1.wav")
            self.assertEqual(len(stored.checksum_sha256), 64)

    def test_oversized_upload_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            settings = self.settings(Path(tmp) / "private", max_upload_bytes=10)
            with self.assertRaisesRegex(ValueError, "OVERSIZED_UPLOAD"):
                validate_wav(fixture_path("P1_OPEN_REFERENCE.wav"), settings)

    def test_duration_over_90_seconds_is_rejected_without_large_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "long.wav"
            write_wav(path, [0.1] * 91, sample_rate=1)
            with self.assertRaisesRegex(ValueError, "DURATION_EXCEEDS_90_SECONDS"):
                validate_wav(path, self.settings(Path(tmp) / "private"))

    def test_invalid_truncated_and_zero_duration_wavs_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            invalid = Path(tmp) / "invalid.wav"
            invalid.write_bytes(b"not a wav")
            with self.assertRaisesRegex(ValueError, "INVALID_WAV"):
                validate_wav(invalid, self.settings(Path(tmp) / "private"))

            valid = Path(tmp) / "valid.wav"
            write_wav(valid, sine_samples(0.2, 220.0))
            truncated = Path(tmp) / "truncated.wav"
            truncated.write_bytes(valid.read_bytes()[:-20])
            with self.assertRaisesRegex(ValueError, "TRUNCATED_WAV|INVALID_WAV"):
                validate_wav(truncated, self.settings(Path(tmp) / "private"))

            zero = Path(tmp) / "zero.wav"
            with wave.open(str(zero), "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(16_000)
            with self.assertRaisesRegex(ValueError, "ZERO_DURATION_WAV"):
                validate_wav(zero, self.settings(Path(tmp) / "private"))

    def test_cleanup_deletes_expired_files_and_tolerates_missing_audio(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "private"
            old_file = root / "scan-old" / "P1_OPEN_REFERENCE_capture.wav"
            new_file = root / "scan-new" / "P1_OPEN_REFERENCE_capture.wav"
            write_wav(old_file, sine_samples(0.1, 220.0))
            write_wav(new_file, sine_samples(0.1, 220.0))
            old_timestamp = time.time() - (25 * 60 * 60)
            os.utime(old_file, (old_timestamp, old_timestamp))

            result = cleanup_expired_private_audio(root, older_than_hours=24)
            self.assertIn(old_file, result.deleted_paths)
            self.assertIn(new_file, result.retained_paths)
            self.assertFalse(old_file.exists())
            self.assertTrue(new_file.exists())

            new_file.unlink()
            retry = cleanup_expired_private_audio(root, older_than_hours=24)
            self.assertEqual(retry.deleted_paths, ())


if __name__ == "__main__":
    unittest.main()
