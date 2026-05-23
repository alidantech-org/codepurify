"""
Field planning for Dart class generation.

This module builds field plans including Dart field names, types, sensitivity,
and JSON serialization/deserialization expressions.

This module must not:
- render templates directly
- decide full class structure
- perform type resolution logic itself
"""

from dataclasses import dataclass
from typing import Any

from constants.dart_syntax import (
    DART_FILE_NAME_FORMAT,
    DART_NULLABLE_SUFFIX,
)
from constants.openapi_keys import (
    OPENAPI_ITEMS,
    OPENAPI_PROPERTIES,
    OPENAPI_TYPE,
    OPENAPI_TYPE_ARRAY,
    OPENAPI_TYPE_OBJECT,
)
from constants.sensitive_fields import (
    SENSITIVE_FIELD_NAME_PARTS,
    SENSITIVE_FIELD_NAMES,
)
from ..codegen.json_expr import build_from_json_expr, build_to_json_expr
from ..fields import to_dart_name
from ..registry import DartSymbol
from ..type_system.resolver import resolve_type
from utils.naming import pascal_case

Schema = dict[str, Any]


@dataclass(frozen=True)
class DartFieldPlan:
    json_name: str
    dart_name: str
    dart_type: str
    copy_with_type: str
    required: bool
    nullable: bool
    is_list: bool
    is_enum: bool
    is_model: bool
    is_sensitive: bool
    import_uri: str | None
    from_json_expr: str
    to_json_expr: str


def build_copy_with_type(dart_type: str) -> str:
    """Remove existing ? and add ? to make it nullable for copyWith."""
    if dart_type.endswith(DART_NULLABLE_SUFFIX):
        return dart_type

    return DART_FILE_NAME_FORMAT.format(dart_type, DART_NULLABLE_SUFFIX)


def build_field_plans(
    properties: dict[str, Schema],
    required_fields: set[str],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    fields_class_name: str,
    owner_name: str | None = None,
    schemas: dict[str, Schema] | None = None,
    version_folder: str = "latest",
) -> list[DartFieldPlan]:
    """
    Build Dart field plans for a class/model/DTO.

    owner_name is optional but strongly recommended because it makes generator
    errors much easier to debug.
    """
    field_plans: list[DartFieldPlan] = []

    for json_name, schema in properties.items():
        dart_name = to_dart_name(json_name)
        required = json_name in required_fields

        # Detect inline object with properties - promote to nested class
        if is_inline_object_schema(schema):
            nested_class_name = f"{owner_name or 'Nested'}{pascal_case(json_name)}"
            # TODO: Create a proper nested class plan and register it
            # For now, create a symbol for it to avoid crash
            if nested_class_name not in symbol_registry:
                from ..registry import DartSymbol
                from ..domain.kinds import SchemaKind
                from pathlib import Path

                symbol_registry[nested_class_name] = DartSymbol(
                    schema_name=nested_class_name,
                    dart_name=nested_class_name,
                    kind=SchemaKind.MODEL,
                    path=Path("models") / "nested" / nested_class_name.lower() / "model.dart",
                )
            # Replace inline schema with a $ref to the nested class
            schema = {"$ref": f"#/components/schemas/{nested_class_name}"}

        # Detect inline array of inline objects
        if schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_ARRAY:
            items = schema.get(OPENAPI_ITEMS)
            if isinstance(items, dict) and is_inline_object_schema(items):
                # TODO: Handle arrays of inline objects properly
                # For now, log a warning and continue
                print(f"TODO: Array of inline objects detected for field {json_name} in {owner_name}")

        try:
            resolved_type = resolve_type(
                schema=schema,
                symbol_registry=symbol_registry,
                package_name=package_name,
                required=required,
                schemas=schemas,
                version_folder=version_folder,
            )
        except Exception as error:
            raise ValueError(
                build_field_resolution_error_message(
                    owner_name=owner_name,
                    json_name=json_name,
                    dart_name=dart_name,
                    required=required,
                    schema=schema,
                    error=error,
                )
            ) from error

        copy_with_type = build_copy_with_type(resolved_type.dart_type)

        field_plans.append(
            DartFieldPlan(
                json_name=json_name,
                dart_name=dart_name,
                dart_type=resolved_type.dart_type,
                copy_with_type=copy_with_type,
                required=required,
                nullable=resolved_type.is_nullable,
                is_list=resolved_type.is_list,
                is_enum=resolved_type.is_enum,
                is_model=resolved_type.is_model,
                is_sensitive=is_sensitive_field(json_name=json_name, dart_name=dart_name),
                import_uri=resolved_type.import_uri,
                from_json_expr=build_from_json_expr(
                    dart_name=dart_name,
                    json_name=json_name,
                    fields_class_name=fields_class_name,
                    resolved_type=resolved_type,
                ),
                to_json_expr=build_to_json_expr(
                    dart_name=dart_name,
                    json_name=json_name,
                    required=required,
                    resolved_type=resolved_type,
                ),
            )
        )

    return field_plans


def is_sensitive_field(json_name: str, dart_name: str) -> bool:
    """Return true when a field should be redacted from generated toString()."""
    names = {
        json_name,
        dart_name,
    }

    for name in names:
        if name in SENSITIVE_FIELD_NAMES:
            return True

        normalized = normalize_sensitive_name(name)

        if normalized in SENSITIVE_FIELD_NAMES:
            return True

        if any(part in normalized for part in SENSITIVE_FIELD_NAME_PARTS):
            return True

    return False


def normalize_sensitive_name(value: str) -> str:
    """Normalize a field name for sensitivity checks."""
    return value.replace("-", "").replace("_", "").lower()


def build_field_resolution_error_message(
    owner_name: str | None,
    json_name: str,
    dart_name: str,
    required: bool,
    schema: Schema,
    error: Exception,
) -> str:
    """Build a helpful error message for failed field type resolution."""
    owner = owner_name or "<unknown owner>"

    lines = [
        "Failed to resolve Dart field type.",
        f"Owner: {owner}",
        f"JSON field: {json_name}",
        f"Dart field: {dart_name}",
        f"Required: {required}",
        f"Inline object: {is_inline_object_schema(schema)}",
        f"Original error: {error}",
        f"Schema: {schema}",
    ]

    return "\n".join(lines)


def is_inline_object_schema(schema: Schema) -> bool:
    """Return true when schema is an inline object with properties."""
    return (
        schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_OBJECT
        and isinstance(schema.get(OPENAPI_PROPERTIES), dict)
        and bool(schema.get(OPENAPI_PROPERTIES))
    )
