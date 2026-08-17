from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ServiceAuth:
    service_role_key: str

    def headers(self) -> dict[str, str]:
        if not self.service_role_key:
            raise RuntimeError("service role key is required")
        return {
            "apikey": self.service_role_key,
            "authorization": f"Bearer {self.service_role_key}",
            "content-type": "application/json",
        }
