from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

PROMPT_IDS = ("P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT")


def write_wav(path: Path, samples: list[float], sample_rate: int = 16_000) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        frames = bytearray()
        for sample in samples:
            clipped = max(-1.0, min(1.0, sample))
            frames.extend(struct.pack("<h", int(clipped * 32767)))
        wav.writeframes(bytes(frames))


def sine_samples(duration_seconds: float, frequency_hz: float, sample_rate: int = 16_000) -> list[float]:
    frame_count = int(duration_seconds * sample_rate)
    return [0.35 * math.sin(2 * math.pi * frequency_hz * index / sample_rate) for index in range(frame_count)]


def fixture_path(name: str) -> Path:
    return Path(__file__).resolve().parent / "fixtures" / name


class FakeRpc:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict[str, object]]] = []
        self._responses_by_idempotency: dict[str, dict[str, object]] = {}

    def call_rpc(self, name: str, payload: dict[str, object]) -> dict[str, object]:
        self.calls.append((name, payload))
        key = str(payload.get("p_idempotency_key", f"{name}:{len(self.calls)}"))
        if key in self._responses_by_idempotency:
            return self._responses_by_idempotency[key]

        response: dict[str, object]
        if name == "register_uploaded_capture_artifact":
            response = {"capture_artifact_id": f"artifact-{payload['p_capture_id']}"}
        elif name == "start_scan_processing_run":
            response = {"processing_run_id": f"run-{payload['p_scan_id']}"}
        elif name == "create_measurement_record":
            response = {
                "measurement_record_id": f"measurement-{payload['p_processing_run_id']}",
                "measurement_status": payload["p_measurement_status"],
            }
        elif name == "create_unresolved_semantic_result":
            response = {
                "semantic_result_id": f"semantic-{payload['p_measurement_record_id']}",
                "status": "unresolved_abstained",
            }
        elif name == "create_evidence_ledger":
            response = {
                "evidence_ledger_id": f"evidence-ledger-{payload['p_measurement_record_id']}",
                "scan_id": "scan-1",
                "measurement_record_id": payload["p_measurement_record_id"],
                "status": "complete",
            }
        elif name == "create_dimension_result":
            response = {
                "dimension_result_id": f"dimension-result-{payload['p_evidence_ledger_id']}",
                "scan_id": "scan-1",
                "evidence_ledger_id": payload["p_evidence_ledger_id"],
                "status": "unresolved_abstained",
            }
        else:
            raise AssertionError(f"Unexpected RPC call: {name}")

        self._responses_by_idempotency[key] = response
        return response


class CrashAfterRpc(FakeRpc):
    def __init__(self, crash_after_name: str) -> None:
        super().__init__()
        self.crash_after_name = crash_after_name

    def call_rpc(self, name: str, payload: dict[str, object]) -> dict[str, object]:
        response = super().call_rpc(name, payload)
        if name == self.crash_after_name:
            raise RuntimeError(f"simulated crash after {name}")
        return response


class OwnerOnlyRecordStore:
    def __init__(self) -> None:
        self.records: dict[str, tuple[str, dict[str, object]]] = {}

    def insert(self, record_id: str, owner_id: str, payload: dict[str, object]) -> None:
        self.records[record_id] = (owner_id, payload)

    def read_as(self, record_id: str, user_id: str) -> dict[str, object]:
        owner_id, payload = self.records[record_id]
        if owner_id != user_id:
            raise PermissionError("RLS_OWNER_READ_BLOCKED")
        return payload
