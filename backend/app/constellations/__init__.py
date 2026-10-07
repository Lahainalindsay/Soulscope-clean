"""Canonical Constellation Engine foundation.

This package is deliberately structural-only until Dimension calibration is
validated. It may explain why a Constellation cannot yet resolve, but it may
not invent geometry, State scores, blends, or confidence.
"""
from .engine import evaluate_constellations
from .models import ConstellationResultSet

__all__ = ["ConstellationResultSet", "evaluate_constellations"]
