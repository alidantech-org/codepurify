"""
Schema normalization utilities for OpenAPI schemas.

This module provides functions to normalize OpenAPI schemas, particularly
for handling nullable types expressed as anyOf/oneOf with null, and
for extracting effective properties from composed schemas.

This module must not:
- perform type resolution
- build generation plans
- render Dart code
"""

from dataclasses import dataclass, field
from typing import Any

from constants.openapi_keys import (
    OPENAPI_ALL_OF,
    OPENAPI_ANY_OF,
    OPENAPI_ENUM,
    OPENAPI_ITEMS,
    OPENAPI_NULLABLE,
    OPENAPI_ONE_OF,
    OPENAPI_PROPERTIES,
    OPENAPI_REF,
    OPENAPI_REQUIRED,
    OPENAPI_TYPE,
    OPENAPI_TYPE_ARRAY,
    OPENAPI_TYPE_BOOLEAN,
    OPENAPI_TYPE_INTEGER,
    OPENAPI_TYPE_NULL,
    OPENAPI_TYPE_NUMBER,
    OPENAPI_TYPE_OBJECT,
    OPENAPI_TYPE_STRING,
)

Schema = dict[str, Any]


@dataclass
class EffectiveObjectSchema:
    """Effective object schema with composition metadata."""

    properties: dict[str, Any] = field(default_factory=dict)
    required: list[str] = field(default_factory=list)
    base_ref: str | None = None
    base_schema_name: str | None = None
    base_properties: dict[str, Any] = field(default_factory=dict)
    base_required: list[str] = field(default_factory=list)
    own_properties: dict[str, Any] = field(default_factory=dict)
    own_required: list[str] = field(default_factory=list)
    nullable: bool = False


def unwrap_nullable_union(schema: Schema) -> tuple[Schema, bool]:
    """
    Unwrap nullable anyOf/oneOf unions to extract the real schema and nullable flag.

    Returns (real_schema, is_nullable) tuple.

    For simple nullable unions like:
      anyOf: [{type: string}, {type: null}]
    Returns ({type: string}, True)

    For complex unions with multiple non-null branches:
      anyOf: [{type: string}, {type: integer}, {type: null}]
    Returns ({type: object}, True) - safe fallback to avoid crashes

    For non-nullable schemas:
      type: string
    Returns ({type: string}, False)
    """
    # Handle OpenAPI 3.1 type arrays (type: [string, null])
    schema_type = schema.get(OPENAPI_TYPE)
    if isinstance(schema_type, list):
        # Find the non-null type
        base_type = None
        has_null = False
        non_null_count = 0

        for item in schema_type:
            if item == OPENAPI_TYPE_NULL:
                has_null = True
            else:
                base_type = item
                non_null_count += 1

        if has_null:
            if non_null_count == 1 and base_type:
                # Single non-null type - normalize it, preserving other fields like items
                normalized = dict(schema)
                normalized[OPENAPI_TYPE] = base_type
                return normalized, True
            else:
                # Multiple non-null types or no base type - fallback to object
                # Return empty dict to signal "unknown type" which resolver will handle as Object
                return {}, True

    any_of = schema.get(OPENAPI_ANY_OF)
    if any_of and isinstance(any_of, list):
        # Find the non-null type
        base_type = None
        has_null = False
        non_null_count = 0

        for item in any_of:
            if isinstance(item, dict):
                if item.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL:
                    has_null = True
                else:
                    base_type = item
                    non_null_count += 1

        if has_null:
            if non_null_count == 1 and base_type:
                # Single non-null type - use it
                return base_type, True
            else:
                # Multiple non-null types or no base type - fallback to object
                return {OPENAPI_TYPE: OPENAPI_TYPE_OBJECT}, True

    one_of = schema.get(OPENAPI_ONE_OF)
    if one_of and isinstance(one_of, list):
        # Find the non-null type
        base_type = None
        has_null = False
        non_null_count = 0

        for item in one_of:
            if isinstance(item, dict):
                if item.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL:
                    has_null = True
                else:
                    base_type = item
                    non_null_count += 1

        if has_null:
            if non_null_count == 1 and base_type:
                # Single non-null type - use it
                return base_type, True
            else:
                # Multiple non-null types or no base type - fallback to object
                return {OPENAPI_TYPE: OPENAPI_TYPE_OBJECT}, True

    return schema, schema.get(OPENAPI_NULLABLE, False)


def normalize_nullable_schema(schema: Schema) -> tuple[Schema, bool]:
    """Normalize anyOf/oneOf with null to extract the base type and nullable flag."""
    return unwrap_nullable_union(schema)


def is_scalar_like_schema(schema: Schema) -> bool:
    """
    Check if a schema is scalar-like (primitive type without properties).

    Scalar schemas can be safely inlined as property refs.
    Returns True for: string, integer, number, boolean, enum, nullable scalar.
    Returns False for: object with properties, array of objects.
    """
    # Handle nullable unions first
    normalized, _ = normalize_nullable_schema(schema)

    # Check for enum - enums are scalar-like
    if normalized.get(OPENAPI_ENUM):
        return True

    schema_type = normalized.get(OPENAPI_TYPE)

    # Primitives are scalar-like
    if schema_type in {OPENAPI_TYPE_STRING, OPENAPI_TYPE_INTEGER, OPENAPI_TYPE_NUMBER, OPENAPI_TYPE_BOOLEAN}:
        return True

    # Arrays might be scalar-like if items are scalar
    if schema_type == OPENAPI_TYPE_ARRAY:
        items = normalized.get(OPENAPI_ITEMS)
        if isinstance(items, dict):
            return is_scalar_like_schema(items)
        return True  # Array without items is treated as scalar

    # Objects with properties are NOT scalar-like
    if schema_type == OPENAPI_TYPE_OBJECT:
        properties = normalized.get(OPENAPI_PROPERTIES)
        if isinstance(properties, dict) and properties:
            return False

    # Default: not scalar-like
    return False


def is_enum_schema(schema: Schema) -> bool:
    """Check if schema is an enum by shape (has enum values)."""
    return bool(schema.get(OPENAPI_ENUM))


def is_object_like_schema(schema: Schema) -> bool:
    """Check if schema is object-like (has properties or is object type)."""
    # Handle nullable unions first
    normalized, _ = normalize_nullable_schema(schema)

    schema_type = normalized.get(OPENAPI_TYPE)
    has_properties = bool(normalized.get(OPENAPI_PROPERTIES))
    return schema_type == OPENAPI_TYPE_OBJECT or has_properties


def get_effective_object_schema(
    schema: Schema,
    schemas: dict[str, Schema] | None = None,
) -> EffectiveObjectSchema:
    """
    Extract effective object schema properties including composition.

    Returns EffectiveObjectSchema with:
    - properties: merged from direct, $ref, and allOf
    - required: merged from all sources
    - base_ref: first $ref in allOf if it's an object schema
    - base_schema_name: schema name of base class
    - base_properties: properties from base schema
    - base_required: required fields from base schema
    - own_properties: properties not from base
    - own_required: required fields not from base
    - nullable: nullable flag

    Supports:
    - Plain object with properties
    - $ref to another schema
    - allOf composition with base class detection
    - anyOf nullable unions
    - OpenAPI 3.1 type arrays
    """
    # Handle nullable unions first
    normalized, is_nullable = normalize_nullable_schema(schema)

    # Start with effective schema
    effective = EffectiveObjectSchema(nullable=is_nullable)

    # Handle $ref - resolve and merge properties from referenced schema
    ref = normalized.get(OPENAPI_REF)
    if ref and schemas:
        ref_name = ref.split("/")[-1]
        if ref_name in schemas:
            ref_schema = schemas[ref_name]
            ref_effective = get_effective_object_schema(ref_schema, schemas)
            effective.properties.update(ref_effective.properties)
            effective.required.extend(ref_effective.required)
            effective.base_ref = ref
            effective.base_schema_name = ref_name
            effective.base_properties.update(ref_effective.properties)
            effective.base_required.extend(ref_effective.required)
            # Don't return early - allow direct properties to be merged
            # This fixes the bug where $ref schemas with additional properties were not handled

    # Handle allOf composition
    all_of = normalized.get(OPENAPI_ALL_OF)
    if all_of and isinstance(all_of, list):
        for index, item in enumerate(all_of):
            if not isinstance(item, dict):
                continue

            item_ref = item.get(OPENAPI_REF)
            if item_ref and schemas:
                ref_name = item_ref.split("/")[-1]
                if ref_name in schemas:
                    ref_schema = schemas[ref_name]
                    ref_effective = get_effective_object_schema(ref_schema, schemas)

                    # First ref in allOf is treated as base class
                    if index == 0:
                        effective.base_ref = item_ref
                        effective.base_schema_name = ref_name
                        effective.base_properties.update(ref_effective.properties)
                        effective.base_required.extend(ref_effective.required)
                    else:
                        # Subsequent refs are treated as additional composition
                        effective.own_properties.update(ref_effective.properties)
                        effective.own_required.extend(ref_effective.required)

                    effective.properties.update(ref_effective.properties)
                    effective.required.extend(ref_effective.required)
                else:
                    # Unknown ref - treat as object with no properties
                    if index == 0:
                        effective.base_ref = item_ref
                        effective.base_schema_name = ref_name
            else:
                # Direct properties in allOf item - these are own fields
                item_props = item.get(OPENAPI_PROPERTIES, {})
                if isinstance(item_props, dict):
                    effective.own_properties.update(item_props)
                    effective.properties.update(item_props)
                item_req = item.get(OPENAPI_REQUIRED, [])
                if isinstance(item_req, list):
                    effective.own_required.extend(item_req)
                    effective.required.extend(item_req)

        return effective

    # Handle direct properties - these are own fields
    properties = normalized.get(OPENAPI_PROPERTIES, {})
    if isinstance(properties, dict):
        effective.own_properties.update(properties)
        effective.properties.update(properties)

    required = normalized.get(OPENAPI_REQUIRED, [])
    if isinstance(required, list):
        effective.own_required.extend(required)
        effective.required.extend(required)

    return effective
