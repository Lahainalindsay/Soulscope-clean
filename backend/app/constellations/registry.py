from __future__ import annotations

from dataclasses import dataclass

from ..dimensions.registry import DIMENSION_DEFINITIONS


@dataclass(frozen=True)
class ConstellationDefinition:
    constellation_id: str
    label: str
    question_answered: str
    dimension_ids: tuple[str, ...]
    state_ids: tuple[str, ...]


CONSTELLATION_DEFINITIONS = (
    ConstellationDefinition(
        "COG",
        "Cognitive Form",
        "How is mental work being organized and sustained?",
        ("COG-P1", "COG-P2", "COG-P3", "COG-P4"),
        ("COG-S01", "COG-S02"),
    ),
    ConstellationDefinition(
        "REG",
        "Regulatory Motion",
        "How is the system responding, adapting, and returning?",
        ("REG-P1", "REG-P2", "REG-P3", "REG-P4"),
        ("REG-S01", "REG-S02"),
    ),
    ConstellationDefinition(
        "CAP",
        "Available Capacity",
        "What resources appear available, and what does current functioning seem to cost?",
        ("CAP-P1", "CAP-P2", "CAP-P3", "CAP-P4"),
        ("CAP-S01", "CAP-S02"),
    ),
    ConstellationDefinition(
        "EXP",
        "Expressive Interface",
        "How is inner activity being carried into outward expression?",
        ("EXP-P1", "EXP-P2", "EXP-P3", "EXP-P4"),
        ("EXP-S01", "EXP-S02"),
    ),
)


def validate_constellation_registry() -> None:
    expected = {
        definition.constellation_id
        for definition in DIMENSION_DEFINITIONS
    }
    actual = {
        dimension.constellation_id
        for dimension in DIMENSION_DEFINITIONS
    }
    if expected != actual:
        raise RuntimeError("Dimension registry constellation membership is inconsistent")
    for definition in CONSTELLATION_DEFINITIONS:
        members = tuple(
            dimension.dimension_id
            for dimension in DIMENSION_DEFINITIONS
            if dimension.constellation_id == definition.constellation_id
        )
        if members != definition.dimension_ids:
            raise RuntimeError(
                f"constellation {definition.constellation_id} does not match canonical Dimension ordering"
            )


validate_constellation_registry()
