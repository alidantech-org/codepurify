"""
Dart inspection data models.

These models hold inspection data before it is printed.
"""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DartInspection:
    spec: dict[str, Any]
    input_path: str
    dart_output: str
    docs_output: str
    package_name: str
    openapi_version: str | None
    paths_count: int
    schemas_count: int
    operations: list[dict[str, Any]]
    tags: list[str]
    plans: Any
    operation_plans: dict[str, Any]
    debug: bool
