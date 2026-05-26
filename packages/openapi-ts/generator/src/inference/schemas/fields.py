"""Schema field inference.

This module provides utilities for inferring field information from
OpenAPI schema objects including type, refs, required status, and more.
"""

from typing import Any

from constants.openapi import ALL_OF, DEFAULT, DESCRIPTION, ENUM, FORMAT, ITEMS, PROPERTIES, REQUIRED, TYPE, TYPE_NULL
from openapi.document import OpenApiDocument
from openapi.refs import get_ref

from inference.metadata.query import infer_query_metadata
from inference.models.schemas import InferredSchemaField
from inference.schemas.field_types import ResolvedFieldType, infer_field_type


def infer_schema_fields(schema: dict[str, Any] | None, document: OpenApiDocument | None = None) -> tuple[InferredSchemaField, ...]:
    """Infer fields from an OpenAPI schema object.

    Args:
        schema: An OpenAPI schema object.
        document: The OpenAPI document for type resolution.

    Returns:
        A tuple of InferredSchemaField objects.
    """
    if not isinstance(schema, dict):
        return ()

    fields: list[InferredSchemaField] = []
    seen_field_names: set[str] = set()

    # Collect direct fields from schema.properties
    properties = schema.get(PROPERTIES)
    if isinstance(properties, dict):
        required_fields = schema.get(REQUIRED, [])
        if not isinstance(required_fields, list):
            required_fields = []

        for field_name, field_schema in properties.items():
            if not isinstance(field_schema, dict):
                continue

            if field_name not in seen_field_names:
                field = _infer_field(field_name, field_schema, required_fields, document)
                fields.append(field)
                seen_field_names.add(field_name)

    # Collect fields from inline objects inside allOf
    all_of = schema.get(ALL_OF)
    if isinstance(all_of, list):
        for item in all_of:
            if not isinstance(item, dict):
                continue

            # Skip if it's a ref (don't resolve inherited fields here)
            if get_ref(item) is not None:
                continue

            # Process inline object with properties
            item_properties = item.get(PROPERTIES)
            if isinstance(item_properties, dict):
                item_required = item.get(REQUIRED, [])
                if not isinstance(item_required, list):
                    item_required = []

                for field_name, field_schema in item_properties.items():
                    if not isinstance(field_schema, dict):
                        continue

                    if field_name not in seen_field_names:
                        field = _infer_field(field_name, field_schema, item_required, document)
                        fields.append(field)
                        seen_field_names.add(field_name)

    return tuple(fields)


def _infer_field(
    name: str,
    schema: dict[str, Any],
    required_fields: list[str],
    document: OpenApiDocument | None = None,
) -> InferredSchemaField:
    """Infer a single field from its schema.

    Args:
        name: The field name.
        schema: The field schema object.
        required_fields: List of required field names.
        document: The OpenAPI document for type resolution.

    Returns:
        An InferredSchemaField object.
    """
    is_required = name in required_fields
    raw_type = schema.get(TYPE)
    format_value = schema.get(FORMAT)

    # Check for nullable via type array ["string", "null"]
    nullable = False
    if isinstance(raw_type, list):
        nullable = TYPE_NULL in raw_type
        # Get the non-null type
        non_null_types = [t for t in raw_type if t != TYPE_NULL]
        raw_type = non_null_types[0] if non_null_types else None

    ref = get_ref(schema)
    schema_ref = ref.raw if ref else None

    # Handle array items
    item_ref = None
    item_refs: list[str] = []
    items = schema.get(ITEMS)
    if isinstance(items, dict):
        item_ref_obj = get_ref(items)
        if item_ref_obj:
            item_ref = item_ref_obj.raw
            item_refs.append(item_ref)

    # Handle enum values
    enum_values = schema.get(ENUM)
    if isinstance(enum_values, list):
        enum_values = tuple(str(v) for v in enum_values)
    else:
        enum_values = None

    default = schema.get(DEFAULT)
    description = schema.get(DESCRIPTION)

    # Resolve field type information
    resolved_types: ResolvedFieldType | None = None
    if document:
        resolved_types = infer_field_type(schema, document)

    # Extract query metadata from x-codegen.query
    query_meta = infer_query_metadata(schema)

    return InferredSchemaField(
        name=name,
        required=is_required,
        nullable=nullable,
        raw_type=str(raw_type) if raw_type else None,
        format=str(format_value) if format_value else None,
        schema_ref=schema_ref,
        schema_refs=tuple([schema_ref]) if schema_ref else (),
        item_ref=item_ref,
        item_refs=tuple(item_refs),
        enum_values=enum_values,
        default=default,
        description=str(description) if description else None,
        resolved_kind=resolved_types.resolved_kind if resolved_types else None,
        resolved_type=resolved_types.resolved_type if resolved_types else None,
        resolved_format=resolved_types.resolved_format if resolved_types else None,
        resolved_item_kind=resolved_types.resolved_item_kind if resolved_types else None,
        resolved_item_type=resolved_types.resolved_item_type if resolved_types else None,
        resolved_item_format=resolved_types.resolved_item_format if resolved_types else None,
        query=query_meta,
    )
