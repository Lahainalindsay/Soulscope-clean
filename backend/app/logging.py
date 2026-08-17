from __future__ import annotations

import logging
import os


def configure_logging() -> None:
    level_name = os.environ.get("SOULSCOPE_LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def safe_log_context(**values: object) -> dict[str, object]:
    return {key: value for key, value in values.items() if value is not None}
