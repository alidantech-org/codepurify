"""
Inline enum extraction from property schemas.

This module detects inline enums in property schemas (properties with enum values
or array items with enum values) and generates enum symbols and plans for them.

This module must not:
- render templates
- write files
- handle class field logic beyond enum detection
"""

from dataclasses import dataclass
from typing import Any

from constants.openapi_keys import (
    OPENAPI_ENUM,
    OPENAPI_ITEMS,
    OPENAPI_PROPERTIES,
    OPENAPI_REF,
    OPENAPI_TYPE,
    OPENAPI_TYPE_ARRAY,
)
from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol
from dart.planning.enum_plan import DartEnumPlan, DartEnumValue, to_enum_value_name
from dart.render.paths import enum_output_path
from utils.naming import pascal_case

Schema = dict[str, Any]


@dataclass(frozen=True)
class InlineEnumExtraction:
    """Result of inline enum extraction."""

    enum_name: str
    schema_name: str
    schema: Schema
    symbol: DartSymbol
    enum_plan: DartEnumPlan


def extract_inline_enums_from_schema(
    schema_name: str,
    schema: Schema,
    owner_class_name: str,
    resource_domain: str,
    package_name: str,
) -> list[InlineEnumExtraction]:
    """
    Extract inline enums from a schema's properties.

    Args:
        schema_name: The schema name (for generating unique enum names)
        schema: The schema object containing properties
        owner_class_name: The Dart class name that owns these properties
        resource_domain: The resource domain for path generation
        package_name: The package name for import URIs

    Returns:
        List of InlineEnumExtraction for each inline enum found
    """
    extractions: list[InlineEnumExtraction] = []

    properties = schema.get(OPENAPI_PROPERTIES, {})
    if not isinstance(properties, dict):
        return extractions

    for prop_name, prop_schema in properties.items():
        if not isinstance(prop_schema, dict):
            continue

        # Skip if property is already a $ref (e.g., to an enum component)
        # We only extract actual inline enums, not refs to existing enum components
        if OPENAPI_REF in prop_schema:
            continue

        # Check for inline enum in property
        if OPENAPI_ENUM in prop_schema:
            enum_name = f"{owner_class_name}{pascal_case(prop_name)}Value"
            extraction = _build_inline_enum_extraction(
                enum_name=enum_name,
                prop_name=prop_name,
                prop_schema=prop_schema,
                owner_class_name=owner_class_name,
                resource_domain=resource_domain,
                package_name=package_name,
            )
            if extraction:
                extractions.append(extraction)
            continue

        # Check for inline enum in array items
        if prop_schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_ARRAY:
            items_schema = prop_schema.get(OPENAPI_ITEMS)
            if isinstance(items_schema, dict):
                # Skip if items is already a $ref (e.g., to an enum component)
                if OPENAPI_REF in items_schema:
                    continue
                if OPENAPI_ENUM in items_schema:
                    enum_name = f"{owner_class_name}{pascal_case(prop_name)}Value"
                    extraction = _build_inline_enum_extraction(
                        enum_name=enum_name,
                        prop_name=prop_name,
                        prop_schema=items_schema,
                        owner_class_name=owner_class_name,
                        resource_domain=resource_domain,
                        package_name=package_name,
                    )
                    if extraction:
                        extractions.append(extraction)

    return extractions


def _build_inline_enum_extraction(
    enum_name: str,
    prop_name: str,
    prop_schema: Schema,
    owner_class_name: str,
    resource_domain: str,
    package_name: str,
) -> InlineEnumExtraction | None:
    """Build an InlineEnumExtraction for a single inline enum."""
    enum_values = prop_schema.get(OPENAPI_ENUM, [])
    if not enum_values:
        return None

    # Generate a unique schema name for the inline enum
    # Use owner_class_name + prop_name to ensure uniqueness
    schema_name = f"{owner_class_name}{pascal_case(prop_name)}Value"

    # Build enum values
    value_plans = []
    for value in enum_values:
        wire_value = str(value)
        dart_name = to_enum_value_name(wire_value)
        value_plans.append(DartEnumValue(dart_name=dart_name, wire_value=wire_value))

    # Build output path
    output_path = enum_output_path(resource_domain, enum_name)

    # Build symbol
    symbol = DartSymbol(
        schema_name=schema_name,
        dart_name=enum_name,
        kind=SchemaKind.ENUM,  # type: ignore
        path=output_path,
    )

    # Build enum plan
    enum_plan = DartEnumPlan(
        enum_name=enum_name,
        schema_name=schema_name,
        output_path=output_path,
        values=value_plans,
    )

    return InlineEnumExtraction(
        enum_name=enum_name,
        schema_name=schema_name,
        schema=prop_schema,
        symbol=symbol,
        enum_plan=enum_plan,
    )


def replace_inline_enum_with_ref(
    prop_schema: Schema,
    enum_symbol: DartSymbol,
) -> Schema:
    """
    Replace an inline enum schema with a $ref to the generated enum.

    Args:
        prop_schema: The original property schema with inline enum
        enum_symbol: The symbol for the generated enum

    Returns:
        A new schema with $ref instead of inline enum
    """
    # Create a reference schema
    ref_schema: Schema = {
        "$ref": f"#/components/schemas/{enum_symbol.schema_name}",
    }

    # Preserve nullable if present
    if prop_schema.get("nullable"):
        ref_schema["nullable"] = True

    return ref_schema
