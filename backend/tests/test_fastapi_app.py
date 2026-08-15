from __future__ import annotations

import importlib.util
import unittest

if importlib.util.find_spec("fastapi") is None:
    raise unittest.SkipTest("FastAPI is not installed; install backend[dev] to run ASGI smoke tests.")

from app.main import app, health


class FastApiSmokeTests(unittest.TestCase):
    def test_health_endpoint_responds_in_process(self) -> None:
        health_routes = [route for route in app.routes if getattr(route, "path", None) == "/health"]

        self.assertEqual(app.title, "SoulScope Backend")
        self.assertEqual(len(health_routes), 1)
        self.assertEqual(
            health(),
            {
                "status": "ok",
                "service": "soulscope-backend",
                "mode": "measurement-only",
            },
        )


if __name__ == "__main__":
    unittest.main()
