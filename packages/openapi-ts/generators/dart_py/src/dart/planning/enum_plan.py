"""
Dart enum generation planning from OpenAPI enum schemas.

This module builds enum generation plans including enum values, wire values,
and output paths.

This module must not:
- handle class field logic
- generate operation/client plans
- contain reusable field registry logic
- render templates
- write files
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.dart_keywords import DART_RESERVED_WORDS
from constants.dart_syntax import DART_VALUE_SUFFIX
from constants.openapi_keys import OPENAPI_ENUM
from dart.registry import DartSymbol
from utils.naming import camel_case

Schema = dict[str, Any]


@dataclass(frozen=True)
class DartEnumValue:
    dart_name: str
    wire_value: str


@dataclass(frozen=True)
class DartEnumPlan:
    enum_name: str
    schema_name: str
    output_path: Path
    values: list[DartEnumValue]
    description: str = ""


def build_enum_plan(
    schema_name: str,
    schema: Schema,
    symbol: DartSymbol,
) -> DartEnumPlan:
    enum_name = symbol.dart_name
    output_path = symbol.path

    if not output_path:
        raise ValueError(f"Cannot build enum plan for schema without path: {schema_name}")

    enum_values = schema.get(OPENAPI_ENUM, [])

    value_plans = []
    for value in enum_values:
        wire_value = str(value)
        dart_name = to_enum_value_name(wire_value)
        value_plans.append(DartEnumValue(dart_name=dart_name, wire_value=wire_value))

    return DartEnumPlan(
        enum_name=enum_name,
        schema_name=schema_name,
        output_path=output_path,
        values=value_plans,
    )


def to_enum_value_name(wire_value: str) -> str:
    # Convert to camelCase
    dart_name = camel_case(wire_value)

    # Handle reserved words
    if dart_name in DART_RESERVED_WORDS:
        dart_name = dart_name + DART_VALUE_SUFFIX

    return dart_name
