"""
Generated Dart plan registry package.

Exports the main build_dart_plans entrypoint and plan dataclasses.
"""

from .builder import build_dart_plans
from .models import DartBarrelPlan, DartFieldsPlan, DartGenerationPlan

__all__ = [
    "build_dart_plans",
    "DartBarrelPlan",
    "DartFieldsPlan",
    "DartGenerationPlan",
]
