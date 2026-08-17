from __future__ import annotations

from dataclasses import dataclass

EVIDENCE_MARKER_VERSION = "0.1"
EVIDENCE_FAMILIES = ("PRO", "ENG", "TIM", "PHO", "SPE", "DYN")


@dataclass(frozen=True)
class EvidenceMarker:
    marker_id: str
    family: str
    candidate_feature_ids: tuple[str, ...]
    prompt_scopes: tuple[str, ...]
    composite: bool = False
    minimum_independent_inputs: int = 1


PROMPT_IDS = ("P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT")
PROMPT_CONTRAST_SCOPES = ("P2_VS_P1", "P3_VS_P1", "P3_VS_P2")

EVIDENCE_MARKERS: tuple[EvidenceMarker, ...] = (
    EvidenceMarker("EV_PRO_001", "PRO", ("AC_LLD_F0_ST",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_PRO_002", "PRO", ("AC_LLD_F0_ST",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_PRO_003", "PRO", ("AC_LLD_F0_ST",), PROMPT_IDS),
    EvidenceMarker("EV_PRO_004", "PRO", ("SS_F0_DRIFT",), PROMPT_IDS),
    EvidenceMarker("EV_ENG_001", "ENG", ("AC_LLD_LOUDNESS",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_ENG_002", "ENG", ("AC_LLD_LOUDNESS",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_ENG_003", "ENG", ("SS_LOUDNESS_DRIFT",), PROMPT_IDS),
    EvidenceMarker("EV_TIM_001", "TIM", ("SS_RESPONSE_ONSET_LATENCY",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_TIM_002", "TIM", ("SS_PAUSE_LOAD",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_TIM_003", "TIM", ("SS_PAUSE_MEDIAN", "SS_PAUSE_P90"), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_TIM_004", "TIM", ("SS_PAUSE_RATE",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_TIM_005", "TIM", ("SS_SPEECH_RATE",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_TIM_006", "TIM", ("SS_ARTICULATION_RATE",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_TIM_007", "TIM", ("SS_RUN_MEAN", "SS_RUN_VARIABILITY"), PROMPT_IDS),
    EvidenceMarker(
        "EV_TIM_008",
        "TIM",
        ("Q_VOICED_RATIO", "SS_PAUSE_LOAD", "SS_RUN_MEAN", "SS_PAUSE_RATE"),
        PROMPT_IDS,
        composite=True,
        minimum_independent_inputs=2,
    ),
    EvidenceMarker(
        "EV_TIM_009",
        "TIM",
        ("SS_PAUSE_LOAD", "SS_PAUSE_MEDIAN", "SS_PAUSE_P90", "SS_PAUSE_RATE", "SS_RUN_MEAN"),
        PROMPT_IDS,
        composite=True,
        minimum_independent_inputs=2,
    ),
    EvidenceMarker("EV_PHO_001", "PHO", ("SS_CPP_MEAN", "SS_CPP_VARIABILITY", "SS_CPP_DRIFT"), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_PHO_002", "PHO", ("AC_LLD_HNR",), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_PHO_003", "PHO", ("AC_LLD_JITTER_LOCAL", "AC_LLD_SHIMMER_LOCAL_DB"), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker(
        "EV_PHO_004",
        "PHO",
        ("SS_CPP_MEAN", "AC_LLD_HNR", "AC_LLD_JITTER_LOCAL", "AC_LLD_SHIMMER_LOCAL_DB"),
        PROMPT_IDS,
        composite=True,
        minimum_independent_inputs=2,
    ),
    EvidenceMarker("EV_SPE_001", "SPE", ("AC_LLD_ALPHA_RATIO", "AC_LLD_HAMMARBERG", "AC_LLD_SLOPE_0_500", "AC_LLD_SLOPE_500_1500"), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_SPE_002", "SPE", ("AC_LLD_SPECTRAL_FLUX", "SS_SPECTRAL_FLUX_DRIFT"), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker("EV_SPE_003", "SPE", ("AC_LLD_F1_FREQ", "AC_LLD_F2_FREQ", "AC_LLD_F3_FREQ"), PROMPT_CONTRAST_SCOPES),
    EvidenceMarker(
        "EV_DYN_001",
        "DYN",
        ("SS_F0_DRIFT", "SS_LOUDNESS_DRIFT", "SS_CPP_DRIFT", "SS_RATE_DRIFT", "SS_PAUSE_LOAD"),
        PROMPT_IDS,
        composite=True,
        minimum_independent_inputs=1,
    ),
    EvidenceMarker("EV_DYN_002", "DYN", ("AC_LLD_F0_ST", "AC_LLD_LOUDNESS", "AC_LLD_SPECTRAL_FLUX"), PROMPT_IDS, composite=True),
    EvidenceMarker(
        "EV_DYN_003",
        "DYN",
        ("EV_PRO_002", "EV_ENG_002", "EV_TIM_002", "EV_TIM_005", "EV_PHO_001", "EV_SPE_002"),
        ("ALL_PROMPTS",),
        composite=True,
        minimum_independent_inputs=2,
    ),
    EvidenceMarker("EV_DYN_004", "DYN", ("EV_PRO_002", "EV_ENG_002", "EV_TIM_002", "EV_SPE_002"), ("ALL_PROMPTS",), composite=True, minimum_independent_inputs=2),
    EvidenceMarker(
        "EV_DYN_005",
        "DYN",
        ("EV_PRO_002", "EV_ENG_002", "EV_TIM_007", "EV_PHO_004", "EV_SPE_002"),
        ("ALL_PROMPTS",),
        composite=True,
        minimum_independent_inputs=2,
    ),
    EvidenceMarker("EV_DYN_006", "DYN", ("EV_DYN_005", "EV_DYN_003"), ("ALL_PROMPTS",), composite=True, minimum_independent_inputs=2),
    EvidenceMarker("EV_DYN_007", "DYN", ("EV_PRO_002", "EV_ENG_002", "EV_TIM_008", "EV_PHO_004", "EV_SPE_002"), ("ALL_PROMPTS",), composite=True, minimum_independent_inputs=2),
    EvidenceMarker("EV_DYN_008", "DYN", ("EV_PRO_002", "EV_ENG_002", "EV_TIM_008", "EV_PHO_004", "EV_SPE_002"), ("ALL_PROMPTS",), composite=True, minimum_independent_inputs=2),
    EvidenceMarker("EV_DYN_009", "DYN", ("EV_TIM_008", "EV_DYN_001", "EV_PHO_004", "EV_ENG_003", "EV_PRO_004"), PROMPT_IDS, composite=True, minimum_independent_inputs=2),
)

MARKERS_BY_ID = {marker.marker_id: marker for marker in EVIDENCE_MARKERS}

SIMPLIFIED_MARKER_ALIASES = {
    "PROSODIC_EXPANSION": "EV_PRO_002",
    "PROSODIC_COMPRESSION": "EV_PRO_002",
    "OUTPUT_CONTINUITY": "EV_TIM_008",
    "TEMPORAL_FRAGMENTATION": "EV_TIM_009",
    "PHONATORY_SHIFT": "EV_PHO_001",
    "PHONATORY_STABILITY": "EV_PHO_004",
    "MODULATION_BREADTH": "EV_DYN_005",
    "CONTEXT_RECONFIGURATION": "EV_DYN_003",
    "CONTEXT_CONSISTENCY": "EV_DYN_004",
    "WITHIN_PROMPT_DRIFT": "EV_DYN_001",
}


def marker_family(marker_id: str) -> str | None:
    marker = MARKERS_BY_ID.get(marker_id) or MARKERS_BY_ID.get(SIMPLIFIED_MARKER_ALIASES.get(marker_id, ""))
    return None if marker is None else marker.family


def canonical_marker_id(marker_id: str) -> str:
    if marker_id in MARKERS_BY_ID:
        return marker_id
    if marker_id in SIMPLIFIED_MARKER_ALIASES:
        return SIMPLIFIED_MARKER_ALIASES[marker_id]
    raise ValueError(f"unknown Evidence marker ID: {marker_id}")
