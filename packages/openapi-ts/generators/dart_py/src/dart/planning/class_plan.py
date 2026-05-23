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

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_COLLECTION_IMPORT,
    DART_FIELDS_CLASS_SUFFIX,
    DART_RESPONSE_FOLDER_PREFIX,
    FIELDS_FILE_NAME,
    INDEX_FILE_NAME,
    MODEL_FILE_NAME,
    format_package_import,
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
from ..type_system.schema_normalizer import get_effective_object_schema
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

    # Inheritance fields (with defaults)
    base_schema_name: str | None = None
    base_class_name: str | None = None
    base_import_uri: str | None = None
    base_fields: list[DartFieldPlan] = field(default_factory=list)
    own_fields: list[DartFieldPlan] = field(default_factory=list)
    render_fields: list[DartFieldPlan] = field(default_factory=list)

    # copyWith fields (inherited + own for valid override)
    copy_with_fields: list[DartFieldPlan] = field(default_factory=list)
    has_copy_with_override: bool = False


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
    schemas: dict[str, Schema] | None = None,
    version_folder: str = "latest",
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

    # Use effective schema to extract properties from allOf, $ref, and direct properties
    effective_schema = get_effective_object_schema(schema, schemas)

    # Build base fields if there's a base class
    base_schema_name = effective_schema.base_schema_name
    base_class_name = None
    base_import_uri = None
    base_field_plans = []
    own_field_plans = []

    if base_schema_name and base_schema_name in symbol_registry:
        base_symbol = symbol_registry[base_schema_name]
        base_class_name = base_symbol.dart_name
        if base_symbol.path:
            from ..type_system.imports import format_package_import

            # Import the index.dart barrel instead of model.dart
            # base_symbol.path is version-root-relative, so prepend version_folder for package import
            base_path = base_symbol.path.parent / "index.dart"
            base_import_uri = format_package_import(package_name, f"{version_folder}/{base_path.as_posix()}")

        # Build base field plans
        base_required = set(effective_schema.base_required)
        base_field_plans = build_field_plans(
            properties=effective_schema.base_properties,
            required_fields=base_required,
            symbol_registry=symbol_registry,
            package_name=package_name,
            fields_class_name=f"{fields_class_name}Base",
            owner_name=class_name,
            schemas=schemas,
            version_folder=version_folder,
            parent_artifact_folder=artifact_folder,
        )

    # Build own field plans
    own_required = set(effective_schema.own_required)
    own_field_plans = build_field_plans(
        properties=effective_schema.own_properties,
        required_fields=own_required,
        symbol_registry=symbol_registry,
        package_name=package_name,
        fields_class_name=fields_class_name,
        owner_name=class_name,
        schemas=schemas,
        version_folder=version_folder,
        parent_artifact_folder=artifact_folder,
    )

    # Plan nested objects from own properties
    from .nested_object_planner import plan_nested_objects_recursively

    plan_nested_objects_recursively(
        properties=effective_schema.own_properties,
        parent_class_name=class_name,
        parent_artifact_folder=artifact_folder,
        symbol_registry=symbol_registry,
        package_name=package_name,
        schemas=schemas,
        nesting_depth=0,
    )

    # Combined fields for compatibility
    # Deduplicate: own fields override base fields with same name
    field_plans_by_name = {field.json_name: field for field in base_field_plans}
    for field in own_field_plans:
        field_plans_by_name[field.json_name] = field
    field_plans = list(field_plans_by_name.values())

    # Render fields: own fields only if base class exists, otherwise all fields
    render_fields = own_field_plans if base_class_name else field_plans

    # Build copyWith fields: base fields + own fields for valid override
    # For non-inherited classes, copyWith fields = own fields
    # For inherited classes, copyWith fields = base fields + own fields
    if base_class_name:
        copy_with_field_plans = base_field_plans + own_field_plans
        has_copy_with_override = True
    else:
        copy_with_field_plans = own_field_plans
        has_copy_with_override = False

    imports, has_collection_fields = build_class_imports(
        field_plans=field_plans,
        package_name=package_name,
        fields_path=fields_path,
        model_path=model_path,
        base_class_name=base_class_name,
        base_import_uri=base_import_uri,
        version_folder=version_folder,
    )

    # Enable copyWith for all classes, inherited classes get override
    generate_copy_with = True

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
        generate_copy_with=generate_copy_with,
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
        base_schema_name=base_schema_name,
        base_class_name=base_class_name,
        base_import_uri=base_import_uri,
        base_fields=base_field_plans,
        own_fields=own_field_plans,
        render_fields=render_fields,
        copy_with_fields=copy_with_field_plans,
        has_copy_with_override=has_copy_with_override,
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
    model_path: Path | None = None,
    base_class_name: str | None = None,
    base_import_uri: str | None = None,
    version_folder: str = "latest",
) -> tuple[list[DartImport], bool]:
    """Collect, add required generated imports, and dedupe class imports."""
    imports: list[DartImport] = []
    has_collection_fields = False

    # Add DartJson helper import
    core_json_import = format_package_import(package_name, f"{version_folder}/core/json/index.dart")
    imports.append(DartImport(uri=core_json_import))

    # Add base class import if present
    if base_class_name and base_import_uri:
        imports.append(DartImport(uri=base_import_uri))

    for field in field_plans:
        if field.import_uri:
            imports.append(DartImport(uri=field.import_uri))

        if field.is_list:
            has_collection_fields = True

    if needs_collection_import(has_list=has_collection_fields):
        imports.append(DartImport(uri=DART_COLLECTION_IMPORT))

    # Use relative import for same-folder fields.dart
    if model_path and fields_path.parent == model_path.parent:
        imports.append(DartImport(uri="fields.dart"))
    else:
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
