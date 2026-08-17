from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from app.config import Settings
from app.processing.measurement_writer import MeasurementWriter
from app.processing.quality import evaluate_prompt_quality
from app.processing.worker import PromptAudioInput, ScanWorker

from .support import (
    PROMPT_IDS,
    CrashAfterRpc,
    FakeRpc,
    OwnerOnlyRecordStore,
    fixture_path,
    write_wav,
)


class WorkerIntegrationTests(unittest.TestCase):
    def settings(self, root: Path) -> Settings:
        return Settings(
            supabase_url="http://localhost:54321",
            supabase_service_role_key="service-role",
            private_audio_root=root,
        )

    def prompts(self) -> list[PromptAudioInput]:
        return [
            PromptAudioInput(prompt_id, f"capture-{index}", fixture_path(f"{prompt_id}.wav"))
            for index, prompt_id in enumerate(PROMPT_IDS, start=1)
        ]

    def test_three_prompt_scan_lifecycle_uses_rpcs_and_persists_unresolved_result(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            rpc = FakeRpc()
            worker = ScanWorker(self.settings(Path(tmp) / "private"), MeasurementWriter(rpc))  # type: ignore[arg-type]
            result = worker.process_scan("scan-1", self.prompts())

        rpc_names = [name for name, _payload in rpc.calls]
        self.assertEqual(rpc_names.count("register_uploaded_capture_artifact"), 3)
        self.assertEqual(rpc_names[-3:], [
            "start_scan_processing_run",
            "create_measurement_record",
            "create_unresolved_semantic_result",
        ])
        self.assertEqual(result.measurement_status, "qualified")
        self.assertEqual(result.semantic_status, "unresolved_abstained")

        measurement_payload = next(payload for name, payload in rpc.calls if name == "create_measurement_record")
        self.assertEqual(measurement_payload["p_semantic_eligibility"], True)
        self.assertEqual(measurement_payload["p_renderer_eligibility"], True)
        self.assertEqual(len(measurement_payload["p_prompt_measurements"]), 3)  # type: ignore[arg-type]

    def test_owner_can_read_records_and_other_user_is_blocked(self) -> None:
        store = OwnerOnlyRecordStore()
        store.insert("measurement-1", "owner-user", {"status": "qualified"})

        self.assertEqual(store.read_as("measurement-1", "owner-user")["status"], "qualified")
        with self.assertRaisesRegex(PermissionError, "RLS_OWNER_READ_BLOCKED"):
            store.read_as("measurement-1", "other-user")

    def test_duplicate_processing_request_is_idempotent_at_rpc_boundary(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            rpc = FakeRpc()
            worker = ScanWorker(self.settings(Path(tmp) / "private"), MeasurementWriter(rpc))  # type: ignore[arg-type]
            first = worker.process_scan("scan-idempotent", self.prompts())
            second = worker.process_scan("scan-idempotent", self.prompts())

        self.assertEqual(first.processing_run_id, second.processing_run_id)
        self.assertEqual(first.measurement_record_id, second.measurement_record_id)
        self.assertEqual(first.semantic_result_id, second.semantic_result_id)

    def test_worker_crash_after_file_write_preserves_private_audio_for_retry(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "private"
            rpc = CrashAfterRpc("register_uploaded_capture_artifact")
            worker = ScanWorker(self.settings(root), MeasurementWriter(rpc))  # type: ignore[arg-type]

            with self.assertRaisesRegex(RuntimeError, "simulated crash"):
                worker.process_scan("scan-crash-file", self.prompts())

            self.assertTrue(any(root.rglob("*.wav")))
            self.assertFalse(any(name == "create_measurement_record" for name, _payload in rpc.calls))

    def test_worker_crash_after_measurement_record_preserves_measurement_rpc(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            rpc = CrashAfterRpc("create_measurement_record")
            worker = ScanWorker(self.settings(Path(tmp) / "private"), MeasurementWriter(rpc))  # type: ignore[arg-type]

            with self.assertRaisesRegex(RuntimeError, "simulated crash"):
                worker.process_scan("scan-crash-db", self.prompts())

        self.assertTrue(any(name == "create_measurement_record" for name, _payload in rpc.calls))
        self.assertFalse(any(name == "create_unresolved_semantic_result" for name, _payload in rpc.calls))

    def test_quality_rejects_no_speech_mostly_silence_and_warns_on_clipping(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            silent = root / "silent.wav"
            clipped = root / "clipped.wav"
            write_wav(silent, [0.0] * 16_000)
            write_wav(clipped, [1.0 if index % 2 else -1.0 for index in range(16_000)])

            from app.acoustics.extractor import extract_measurements

            settings = self.settings(root / "private")
            silent_quality = evaluate_prompt_quality(
                extract_measurements(silent, "silent", "P1_OPEN_REFERENCE", settings.silence_rms_threshold),
                settings,
            )
            clipped_quality = evaluate_prompt_quality(
                extract_measurements(clipped, "clipped", "P1_OPEN_REFERENCE", settings.silence_rms_threshold),
                settings,
            )

        self.assertEqual(silent_quality.status, "rejected")
        self.assertIn("NO_SPEECH_OR_MOSTLY_SILENCE", silent_quality.rejection_reasons)
        self.assertEqual(clipped_quality.status, "limited")
        self.assertIn("CLIPPING_DETECTED", clipped_quality.warnings)


if __name__ == "__main__":
    unittest.main()
