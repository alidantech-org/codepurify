"""
Dart class generation planning from resolved OpenAPI schemas.

This module builds complete Dart class plans including fields, imports,
constructor requirements, and generation flags.

This module must not:
- write files
- load OpenAPI documents
- render Jinja templates directly
- classify schemas as class/enum
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_COLLECTION_IMPORT,
    DART_FIELDS_CLASS_SUFFIX,
    DART_RESPONSE_FOLDER_PREFIX,
    FIELDS_FILE_NAME,
    INDEX_FILE_NAME,
    MODEL_FILE_NAME,
)
from constants.openapi_keys import OPENAPI_PROPERTIES, OPENAPI_REQUIRED
from constants.sdk_usage import (
    SDK_OPERATION_DTO_USAGES,
    SDK_USAGE_DTO,
    SDK_USAGE_MODEL,
    SDK_USAGE_SHARED,
    SDK_USAGE_SHARED_ERROR,
)
from ..domain.kinds import SchemaKind
from ..registry import DartSymbol
from ..type_system.imports import (
    DartImport,
    dedupe_imports,
    needs_collection_import,
)
from .field_plan import DartFieldPlan, build_field_plans

Schema = dict[str, Any]


@dataclass(frozen=True)
class DartClassPlan:
    class_name: str
    schema_name: str
    kind: SchemaKind

    # Folder containing model.dart, fields.dart, index.dart
    artifact_folder: Path

    # Files inside artifact_folder
    model_path: Path
    fields_path: Path
    index_path: Path

    fields_class_name: str
    imports: list[DartImport]
    fields: list[DartFieldPlan]
    has_collection_fields: bool

    generate_constructor: bool
    generate_copy_with: bool
    generate_from_json: bool
    generate_to_json: bool
    generate_to_string: bool
    generate_equality: bool
    generate_hash_code: bool

    usage: list[str]
    usage_type: str
    operation_id: str | None
    status_code: str | None
    source_schema: str | None
    is_shared: bool


def build_class_plan(
    schema_name: str,
    schema: Schema,
    symbol: DartSymbol,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    usage: list[str] | None = None,
    usage_type: str | None = None,
    operation_id: str | None = None,
    status_code: str | None = None,
    source_schema: str | None = None,
    is_shared: bool = False,
) -> DartClassPlan:
    """Build a full Dart class generation plan for one schema symbol."""
    class_name = symbol.dart_name
    kind = symbol.kind
    output_path = require_symbol_path(
        schema_name=schema_name,
        symbol=symbol,
    )

    resolved_usage_type = resolve_usage_type(
        kind=kind,
        usage=usage,
        usage_type=usage_type,
    )

    artifact_folder = build_artifact_folder(
        output_path=output_path,
        usage_type=resolved_usage_type,
        operation_id=operation_id,
        status_code=status_code,
    )

    model_path = artifact_folder / MODEL_FILE_NAME
    fields_path = artifact_folder / FIELDS_FILE_NAME
    index_path = artifact_folder / INDEX_FILE_NAME
    fields_class_name = build_fields_class_name(class_name)

    properties = get_schema_properties(schema)
    required_fields = get_required_fields(schema)

    field_plans = build_field_plans(
        properties=properties,
        required_fields=required_fields,
        symbol_registry=symbol_registry,
        package_name=package_name,
        fields_class_name=fields_class_name,
        owner_name=class_name,
    )

    imports, has_collection_fields = build_class_imports(
        field_plans=field_plans,
        package_name=package_name,
        fields_path=fields_path,
    )

    return DartClassPlan(
        class_name=class_name,
        schema_name=schema_name,
        kind=kind,
        artifact_folder=artifact_folder,
        model_path=model_path,
        fields_path=fields_path,
        index_path=index_path,
        fields_class_name=fields_class_name,
        imports=imports,
        fields=field_plans,
        has_collection_fields=has_collection_fields,
        generate_constructor=True,
        generate_copy_with=True,
        generate_from_json=True,
        generate_to_json=True,
        generate_to_string=True,
        generate_equality=True,
        generate_hash_code=True,
        usage=usage or [],
        usage_type=resolved_usage_type,
        operation_id=operation_id,
        status_code=status_code,
        source_schema=source_schema,
        is_shared=is_shared,
    )


def require_symbol_path(
    schema_name: str,
    symbol: DartSymbol,
) -> Path:
    """Return symbol path or fail with useful context."""
    if not symbol.path:
        raise ValueError(f"Cannot build class plan for schema without path: {schema_name}")

    return symbol.path


def build_artifact_folder(
    output_path: Path,
    usage_type: str,
    operation_id: str | None,
    status_code: str | None,
) -> Path:
    """
    Resolve the artifact folder that will contain:
    - model.dart
    - fields.dart
    - index.dart
    """
    if operation_id and usage_type in SDK_OPERATION_DTO_USAGES:
        return output_path.parent / usage_type

    if usage_type == SDK_USAGE_SHARED_ERROR and status_code:
        return output_path.parent / f"{DART_RESPONSE_FOLDER_PREFIX}{status_code}"

    return output_path.parent


def build_fields_class_name(class_name: str) -> str:
    """Build generated fields constants class name."""
    return f"{class_name}{DART_FIELDS_CLASS_SUFFIX}"


def get_schema_properties(schema: Schema) -> dict[str, Schema]:
    """Extract schema properties safely."""
    properties = schema.get(OPENAPI_PROPERTIES, {})

    if properties is None:
        return {}

    if not isinstance(properties, dict):
        raise ValueError(f"Invalid OpenAPI schema properties. Expected dict, got {type(properties).__name__}.")

    return properties


def get_required_fields(schema: Schema) -> set[str]:
    """Extract required field names safely."""
    required = schema.get(OPENAPI_REQUIRED, [])

    if required is None:
        return set()

    if not isinstance(required, list):
        raise ValueError(f"Invalid OpenAPI schema required field list. Expected list, got {type(required).__name__}.")

    return {field for field in required if isinstance(field, str)}


def build_class_imports(
    field_plans: list[DartFieldPlan],
    package_name: str,
    fields_path: Path,
) -> tuple[list[DartImport], bool]:
    """Collect, add required generated imports, and dedupe class imports."""
    imports: list[DartImport] = []
    has_collection_fields = False

    for field in field_plans:
        if field.import_uri:
            imports.append(DartImport(uri=field.import_uri))

        if field.is_list:
            has_collection_fields = True

    if needs_collection_import(has_list=has_collection_fields):
        imports.append(DartImport(uri=DART_COLLECTION_IMPORT))

    imports.append(DartImport.from_package(package_name, fields_path.as_posix()))

    return dedupe_imports(imports), has_collection_fields


def resolve_usage_type(
    kind: SchemaKind,
    usage: list[str] | None,
    usage_type: str | None,
) -> str:
    """Resolve final SDK usage type for a generated class artifact."""
    if usage_type:
        return usage_type

    if not usage:
        return SDK_USAGE_MODEL

    if len(usage) > 1:
        return SDK_USAGE_SHARED

    if kind == SchemaKind.MODEL:
        return SDK_USAGE_MODEL

    return SDK_USAGE_DTO
