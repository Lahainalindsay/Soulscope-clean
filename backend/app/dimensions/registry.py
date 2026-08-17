from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DimensionDefinition:
    dimension_id: str
    label: str
    constellation_id: str
    order: int
    scientific_class: str
    required_evidence_families: tuple[str, ...] = ()
    optional_evidence_families: tuple[str, ...] = ()
    candidate_marker_ids: tuple[str, ...] = ()
    required_marker_ids: tuple[str, ...] = ()
    minimum_independent_families: int | None = None
    required_prompt_scopes: tuple[str, ...] = ()
    structural_prerequisites: tuple[str, ...] = ()


DIMENSION_DEFINITIONS = (
    DimensionDefinition("COG-P1", "Organization", "COG", 1, "D1_DESCRIPTIVE_FUNCTIONAL", ("TIM", "DYN"), (), ("EV_TIM_007", "EV_TIM_008", "EV_TIM_009", "EV_DYN_001", "EV_DYN_007", "EV_DYN_008")),
    DimensionDefinition("COG-P2", "Exploration", "COG", 2, "D2_CONSTRUCT_CALIBRATION_REQUIRED", ("PRO", "TIM", "DYN"), ("ENG", "SPE"), ("EV_PRO_002", "EV_PRO_003", "EV_ENG_002", "EV_SPE_002", "EV_DYN_003", "EV_DYN_005", "EV_DYN_006"), (), None, ("P1", "P2_OR_P3")),
    DimensionDefinition("COG-P3", "Focus Continuity", "COG", 3, "D1_DESCRIPTIVE_FUNCTIONAL", ("TIM",), ("DYN",), ("EV_TIM_002", "EV_TIM_003", "EV_TIM_004", "EV_TIM_007", "EV_TIM_008", "EV_TIM_009", "EV_DYN_009")),
    DimensionDefinition("COG-P4", "Processing Demand", "COG", 4, "D2_CONSTRUCT_CALIBRATION_REQUIRED", (), (), ("EV_TIM_002", "EV_TIM_005", "EV_TIM_006", "EV_TIM_009", "EV_PHO_001", "EV_PHO_004", "EV_SPE_001", "EV_DYN_007", "EV_DYN_008"), (), 3, (), ("MINIMUM_3_OF_TIM_PHO_PRO_SPE_DYN",)),
    DimensionDefinition("REG-P1", "Activation", "REG", 5, "D2_CONSTRUCT_CALIBRATION_REQUIRED", (), (), ("EV_PRO_001", "EV_PRO_002", "EV_ENG_001", "EV_TIM_005", "EV_PHO_001", "EV_SPE_001", "EV_DYN_007"), (), 3, (), ("MINIMUM_3_OF_PRO_ENG_TIM_PHO_SPE_DYN",)),
    DimensionDefinition("REG-P2", "Stability", "REG", 6, "D1_DESCRIPTIVE_FUNCTIONAL", (), (), ("EV_PRO_003", "EV_TIM_007", "EV_TIM_008", "EV_PHO_004", "EV_DYN_002", "EV_DYN_008", "EV_DYN_009"), (), 2, (), ("MINIMUM_2_OF_PRO_TIM_PHO_DYN",)),
    DimensionDefinition("REG-P3", "Flexibility", "REG", 7, "D2_CONSTRUCT_CALIBRATION_REQUIRED", ("DYN",), ("PRO", "ENG", "TIM", "PHO", "SPE"), ("EV_DYN_003", "EV_DYN_007"), ("EV_DYN_003", "EV_DYN_007"), None, ("P1", "P2", "P3"), ("PLUS_AT_LEAST_ONE_OF_PRO_ENG_TIM_PHO_SPE",)),
    DimensionDefinition("REG-P4", "Recovery", "REG", 8, "D3_CURRENT_PROTOCOL_UNOBSERVABLE"),
    DimensionDefinition("CAP-P1", "Mobilization", "CAP", 9, "D1_DESCRIPTIVE_FUNCTIONAL", (), (), ("EV_PRO_002", "EV_ENG_001", "EV_ENG_002", "EV_TIM_005", "EV_TIM_006", "EV_DYN_003", "EV_DYN_007"), (), None, ("P2_VS_P1_OR_P3_VS_P1",)),
    DimensionDefinition("CAP-P2", "Reserve", "CAP", 10, "D3_CURRENT_PROTOCOL_UNOBSERVABLE"),
    DimensionDefinition("CAP-P3", "Effort Cost", "CAP", 11, "D2_CONSTRUCT_CALIBRATION_REQUIRED", (), (), ("EV_TIM_002", "EV_TIM_007", "EV_TIM_009", "EV_PHO_001", "EV_PHO_004", "EV_DYN_001", "EV_DYN_009"), (), 3, (), ("MINIMUM_3_OF_TIM_PHO_PRO_ENG_SPE_DYN",)),
    DimensionDefinition("CAP-P4", "Sustainability", "CAP", 12, "D1_DESCRIPTIVE_FUNCTIONAL", ("DYN",), ("TIM", "PHO", "PRO", "ENG"), ("EV_DYN_001", "EV_DYN_009"), ("EV_DYN_001", "EV_DYN_009"), None, (), ("PLUS_ONE_OR_MORE_OF_TIM_PHO_PRO_ENG",)),
    DimensionDefinition("EXP-P1", "Range", "EXP", 13, "D1_DESCRIPTIVE_FUNCTIONAL", (), (), ("EV_PRO_002", "EV_ENG_002", "EV_SPE_002", "EV_DYN_005"), (), 2, (), ("MINIMUM_2_OF_PRO_ENG_TIM_SPE_DYN",)),
    DimensionDefinition("EXP-P2", "Openness", "EXP", 14, "D2_CONSTRUCT_CALIBRATION_REQUIRED", ("DYN",), ("PRO", "ENG", "TIM"), ("EV_DYN_003", "EV_DYN_005", "EV_DYN_006"), (), None, (), ("EXP-P1_SUFFICIENT_EVIDENCE", "PLUS_COMPATIBLE_PRO_ENG_TIM")),
    DimensionDefinition("EXP-P3", "Restraint", "EXP", 15, "D2_CONSTRUCT_CALIBRATION_REQUIRED", (), (), ("EV_PRO_002", "EV_ENG_002", "EV_DYN_005", "EV_DYN_006"), (), None, (), ("AVAILABLE_RANGE_REQUIRED", "CONTEXT_SPECIFIC_COMPRESSION_REQUIRED")),
    DimensionDefinition("EXP-P4", "Relational Availability", "EXP", 16, "D3_CURRENT_PROTOCOL_UNOBSERVABLE"),
)

D3_ABSTENTION_REASONS = {
    "REG-P4": "NO_RECOVERY_COMPATIBLE_CONDITION",
    "CAP-P2": "NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL",
    "EXP-P4": "NO_RELATIONAL_OBSERVATION",
}
