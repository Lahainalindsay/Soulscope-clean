from __future__ import annotations

import json
from dataclasses import dataclass
from http.client import RemoteDisconnected
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .auth import ServiceAuth


class SupabaseRpc(Protocol):
    def call_rpc(self, name: str, payload: dict[str, Any]) -> dict[str, Any]: ...


class SupabaseRpcError(RuntimeError):
    def __init__(self, operation: str, status_code: int | None, reason: str) -> None:
        self.operation = operation
        self.status_code = status_code
        super().__init__(f"Supabase RPC {operation} failed: {status_code or 'n/a'} {reason}")


@dataclass(frozen=True)
class SupabaseRestRpc:
    supabase_url: str
    auth: ServiceAuth
    timeout_seconds: float = 30.0

    def call_rpc(self, name: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.supabase_url}/rest/v1/rpc/{name}"
        body = json.dumps(payload).encode("utf-8")
        request = Request(url, data=body, headers=self.auth.headers(), method="POST")
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                decoded = response.read().decode("utf-8")
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise SupabaseRpcError(name, exc.code, _safe_rpc_error_reason(detail)) from exc
        except (URLError, RemoteDisconnected, TimeoutError) as exc:
            raise SupabaseRpcError(name, None, "NETWORK_ERROR") from exc

        if not decoded:
            return {}

        data = json.loads(decoded)
        if isinstance(data, list):
            if not data:
                return {}
            if not isinstance(data[0], dict):
                raise TypeError(f"Supabase RPC {name} returned unexpected list payload")
            return data[0]
        if not isinstance(data, dict):
            raise TypeError(f"Supabase RPC {name} returned unexpected payload")
        return data


def _safe_rpc_error_reason(detail: str) -> str:
    lowered = detail.lower()
    if "permission" in lowered or "not authorized" in lowered or "service role" in lowered:
        return "PERMISSION_DENIED"
    if "not found" in lowered:
        return "NOT_FOUND"
    if "idempotency" in lowered:
        return "IDEMPOTENCY_CONFLICT"
    if "invalid" in lowered or "violates" in lowered or "must" in lowered:
        return "CONSTRAINT_ERROR"
    return "RPC_ERROR"
