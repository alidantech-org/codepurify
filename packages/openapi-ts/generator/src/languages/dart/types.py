"""Dart type mapping helpers."""

from __future__ import annotations

from contracts.api import ApiField, ApiFieldKind, ApiSchema
from contracts.template import TemplateDependencyTargetKind


def dart_field_type(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    """Return the Dart type label for a field."""
    base = _dart_base_type(field, schema_by_ref)

    if field.nullable or not field.required:
        return f"{base}?"

    return base


def _dart_base_type(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    if field.type.kind == ApiFieldKind.ARRAY:
        item_type = _dart_array_item_type(field, schema_by_ref)
        return f"List<{item_type}>"

    ref_type = _schema_ref_type(field.schema_ref, schema_by_ref)
    if ref_type is not None:
        return ref_type

    if field.type.kind == ApiFieldKind.PRIMITIVE:
        return _dart_primitive_type(field.type.type, field.type.format)

    if field.type.kind == ApiFieldKind.OBJECT:
        return "Map<String, dynamic>"

    if field.type.kind in {ApiFieldKind.ENUM, ApiFieldKind.MODEL, ApiFieldKind.DTO}:
        return field.type.type or "dynamic"

    return "dynamic"


def _dart_array_item_type(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> str:
    ref_type = _schema_ref_type(field.item_ref, schema_by_ref)
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
) -> str | None:
    if ref is None:
        return None

    schema = schema_by_ref.get(ref)
    if schema is None:
        return None

    return str(schema.name.pascal)


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


def dependency_is_generated_import(kind: TemplateDependencyTargetKind) -> bool:
    """Return whether a dependency target should be imported in Dart."""
    return kind in {
        TemplateDependencyTargetKind.ENUM,
        TemplateDependencyTargetKind.MODEL,
        TemplateDependencyTargetKind.DTO,
    }
