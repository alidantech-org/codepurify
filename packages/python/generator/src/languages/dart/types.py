"""Dart type mapping helpers."""

from __future__ import annotations

from contracts.api import ApiField, ApiFieldKind, ApiSchema, ApiSchemaKind
from contracts.template import TemplateDependencyTargetKind


def dart_field_type(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    """Return the Dart type label for a field."""
    base = _dart_base_type(field, schema_by_ref)

    if base == "dynamic":
        return "dynamic"

    if _field_is_dart_nullable(field, schema_by_ref):
        return f"{base}?"

    return base


def _field_is_dart_nullable(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> bool:
    """Return whether the Dart field type must be nullable."""
    if not field.required:
        return True

    if field.nullable:
        return True

    ref_schema = schema_by_ref.get(field.schema_ref or "")
    if ref_schema is not None and ref_schema.nullable:
        return True

    return False


def _dart_base_type(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    if field.type.kind == ApiFieldKind.ARRAY:
        return f"List<{_dart_array_item_type(field, schema_by_ref)}>"

    ref_type, _ = _schema_ref_type(field.schema_ref, schema_by_ref)
    if ref_type is not None:
        return ref_type

    if field.type.kind == ApiFieldKind.PRIMITIVE:
        return _dart_primitive_type(field.type.type, field.type.format)

    if field.type.kind == ApiFieldKind.OBJECT:
        return "Map<String, dynamic>"

    if field.type.kind in {ApiFieldKind.ENUM, ApiFieldKind.MODEL, ApiFieldKind.DTO}:
        return field.type.type or "dynamic"

    return _fallback_type(field)


def _dart_array_item_type(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    ref_type, _ = _schema_ref_type(field.item_ref, schema_by_ref)
    if ref_type is not None:
        return ref_type

    if field.type.item_kind == ApiFieldKind.PRIMITIVE:
        return _dart_primitive_type(field.type.item_type, field.type.item_format)

    if field.type.item_kind in {ApiFieldKind.ENUM, ApiFieldKind.MODEL, ApiFieldKind.DTO}:
        return field.type.item_type or "dynamic"

    return "dynamic"


def _schema_ref_type(
    ref: str | None,
    schema_by_ref: dict[str, ApiSchema],
) -> tuple[str | None, bool]:
    if ref is None:
        return None, False

    schema = schema_by_ref.get(ref)
    if schema is None:
        return None, False

    if schema.kind == ApiSchemaKind.PRIMITIVE:
        return _primitive_schema_type(schema, schema_by_ref), schema.nullable

    if schema.kind in {ApiSchemaKind.ENUM, ApiSchemaKind.MODEL, ApiSchemaKind.DTO}:
        return str(schema.name.pascal.o), schema.nullable

    return None, False


def _primitive_schema_type(
    schema: ApiSchema,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    direct = _dart_primitive_type(schema.primitive_type, schema.primitive_format)

    if direct != "dynamic":
        return direct

    for ref in schema.composition_refs:
        target = schema_by_ref.get(ref)
        if target is None:
            continue

        if target.kind == ApiSchemaKind.PRIMITIVE:
            resolved = _primitive_schema_type(target, schema_by_ref)
            if resolved != "dynamic":
                return resolved

    if schema.alias_of:
        target = schema_by_ref.get(schema.alias_of)
        if target is not None and target.kind == ApiSchemaKind.PRIMITIVE:
            resolved = _primitive_schema_type(target, schema_by_ref)
            if resolved != "dynamic":
                return resolved

    return "dynamic"


def _dart_primitive_type(type_name: str | None, fmt: str | None) -> str:
    if type_name == "integer":
        return "int"

    if type_name == "number":
        return "double"

    if type_name == "boolean":
        return "bool"

    if type_name == "string" and fmt in {"date", "date-time"}:
        return "DateTime"

    if type_name == "string":
        return "String"

    if type_name == "object":
        return "Map<String, dynamic>"

    return "dynamic"


def _fallback_type(field: ApiField) -> str:
    if field.type.raw_type:
        return _dart_primitive_type(field.type.raw_type, field.type.format)

    return "dynamic"


def dependency_is_generated_import(kind: TemplateDependencyTargetKind) -> bool:
    """Return whether a dependency target should be imported in Dart."""
    return kind in {
        TemplateDependencyTargetKind.ENUM,
        TemplateDependencyTargetKind.MODEL,
        TemplateDependencyTargetKind.DTO,
    }
