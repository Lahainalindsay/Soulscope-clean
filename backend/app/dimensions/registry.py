from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DimensionDefinition:
    dimension_id: str
    label: str
    constellation_id: str
    order: int
    scientific_class: str


DIMENSION_DEFINITIONS = (
    DimensionDefinition("COG-P1", "Organization", "COG", 1, "D1_DESCRIPTIVE_FUNCTIONAL"),
    DimensionDefinition("COG-P2", "Exploration", "COG", 2, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("COG-P3", "Focus Continuity", "COG", 3, "D1_DESCRIPTIVE_FUNCTIONAL"),
    DimensionDefinition("COG-P4", "Processing Demand", "COG", 4, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("REG-P1", "Activation", "REG", 5, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("REG-P2", "Stability", "REG", 6, "D1_DESCRIPTIVE_FUNCTIONAL"),
    DimensionDefinition("REG-P3", "Flexibility", "REG", 7, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("REG-P4", "Recovery", "REG", 8, "D3_CURRENT_PROTOCOL_UNOBSERVABLE"),
    DimensionDefinition("CAP-P1", "Mobilization", "CAP", 9, "D1_DESCRIPTIVE_FUNCTIONAL"),
    DimensionDefinition("CAP-P2", "Reserve", "CAP", 10, "D3_CURRENT_PROTOCOL_UNOBSERVABLE"),
    DimensionDefinition("CAP-P3", "Effort Cost", "CAP", 11, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("CAP-P4", "Sustainability", "CAP", 12, "D1_DESCRIPTIVE_FUNCTIONAL"),
    DimensionDefinition("EXP-P1", "Range", "EXP", 13, "D1_DESCRIPTIVE_FUNCTIONAL"),
    DimensionDefinition("EXP-P2", "Openness", "EXP", 14, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("EXP-P3", "Restraint", "EXP", 15, "D2_CONSTRUCT_CALIBRATION_REQUIRED"),
    DimensionDefinition("EXP-P4", "Relational Availability", "EXP", 16, "D3_CURRENT_PROTOCOL_UNOBSERVABLE"),
)

D3_ABSTENTION_REASONS = {
    "REG-P4": "NO_RECOVERY_COMPATIBLE_CONDITION",
    "CAP-P2": "NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL",
    "EXP-P4": "NO_RELATIONAL_OBSERVATION",
}
