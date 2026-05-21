"""
Plan registry dataclasses.

These are generated Dart planning result containers.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..feature_plan import DartFeaturePlan
from ..route_plan import DartRouteVersionPlan


@dataclass(frozen=True)
class DartFieldsPlan:
    fields_class_name: str
    output_path: Path
    all_field_names: list[str]


@dataclass(frozen=True)
class DartBarrelPlan:
    output_path: Path
    exports: list[str]


@dataclass(frozen=True)
class DartGenerationPlan:
    classes: dict[str, Any]
    enums: dict[str, Any]
    barrels: list[DartBarrelPlan]
    route_versions: list[DartRouteVersionPlan]
    features: list[DartFeaturePlan]
