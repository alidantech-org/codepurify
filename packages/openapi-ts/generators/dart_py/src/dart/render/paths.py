"""
Output path naming utilities for generated Dart files.

This module handles output path naming for schemas, enums, DTOs, and operations.
It determines where generated files should be placed based on schema kind,
usage patterns, and domain inference.

This module must not:
- parse OpenAPI schemas
- generate Dart types
- render templates
- write files
"""

from pathlib import Path

# Centralized path helpers for versioned barrel path handling


def normalize_artifact_folder(path: Path | str, version_folder: str | None = None) -> Path:
    """
    Returns a version-root-relative artifact folder.
    Strips leading v1/latest if accidentally present.

    Args:
        path: The artifact folder path (may or may not include version prefix)
        version_folder: Optional version folder name (e.g., "v1", "latest")

    Returns:
        Version-root-relative path (e.g., "features", "models/user")

    Examples:
        normalize_artifact_folder("v1/features", "v1") -> Path("features")
        normalize_artifact_folder("latest/models/user", "latest") -> Path("models/user")
        normalize_artifact_folder("models/user", "v1") -> Path("models/user")
    """
    p = Path(path)

    if version_folder:
        version = Path(version_folder)
        if p == version:
            return Path(".")
        if p.is_relative_to(version):
            return p.relative_to(version)

    parts = p.parts
    if parts and parts[0] in {"v1", "v2", "v3", "latest"}:
        return Path(*parts[1:]) if len(parts) > 1 else Path(".")

    return p


def versioned_write_path(lib_root: Path, version_folder: str, artifact_folder: Path | str, file_name: str) -> Path:
    """
    Returns the full write path for an artifact, prepending lib/{version}/.

    Args:
        lib_root: The lib root directory (e.g., packages/dart/lib)
        version_folder: Version folder name (e.g., "v1", "latest")
        artifact_folder: Version-root-relative artifact folder (e.g., "features", "models/user")
        file_name: The file name (e.g., "user_feature.dart")

    Returns:
        Full write path (e.g., lib/v1/features/user_feature.dart)

    Examples:
        versioned_write_path(Path("lib"), "v1", "features", "user_feature.dart")
        -> Path("lib/v1/features/user_feature.dart")
    """
    artifact = normalize_artifact_folder(artifact_folder, version_folder)
    return lib_root / version_folder / artifact / file_name


def dart_export_path(path: Path | str) -> str:
    """
    Returns a POSIX-formatted path for Dart import/export statements.

    Args:
        path: The path to format

    Returns:
        POSIX-formatted path string with forward slashes

    Examples:
        dart_export_path(Path("models") / "user" / "index.dart")
        -> "models/user/index.dart"
    """
    return Path(path).as_posix()


def as_path(value: Path | str) -> Path:
    """
    Converts a string or Path to a Path object.

    Args:
        value: The path value to convert

    Returns:
        Path object

    Examples:
        as_path("features") -> Path("features")
        as_path(Path("models")) -> Path("models")
    """
    return value if isinstance(value, Path) else Path(value)


from constants.dart_syntax import (
    BODY_FILE_NAME,
    DART_DTOS_FOLDER,
    DART_ENUMS_SUBFOLDER,
    DART_MODELS_FOLDER,
    DART_FILE_EXTENSION,
    DART_FIELDS_SUFFIX,
    DART_FILE_NAME_FORMAT,
    DART_FILE_NAME_WITH_SUFFIX_FORMAT,
    DART_PARAMS_SUFFIX,
    DART_SHARED_FOLDER,
    ENUM_FILE_NAME,
    FIELDS_FILE_NAME,
    MODEL_FILE_NAME,
    PARAMS_FILE_NAME,
    QUERY_FILE_NAME,
    RESPONSE_FILE_NAME,
    DART_LOCATION_PARAMETER,
    DART_LOCATION_REQUEST_BODY,
    DART_LOCATION_RESPONSE,
)

# Local path roots for safe path joining
_DART_MODELS_ROOT = as_path(DART_MODELS_FOLDER)
_DART_DTOS_ROOT = as_path(DART_DTOS_FOLDER)
_DART_SHARED_ROOT = as_path(DART_SHARED_FOLDER)

from ..domain.models import infer_enum_domain, infer_model_domain, infer_operation_name, infer_tag_domain
from ..domain.kinds import DartFolder, SchemaKind
from ..planning.operation_usage import SchemaUsage
from openapi.codegen_metadata import read_codegen_metadata
from utils.naming import snake_case


def normalize_resource_folder(resource: str) -> str:
    """
    Normalize resource name to a consistent folder name.

    This is the single source of truth for resource folder naming.
    All resource folder decisions must go through this function.

    Current rule: singularize the resource name.
    Examples: "users" -> "user", "items" -> "item", "user" -> "user"
    """
    # Simple singularization - remove trailing 's' if present
    # This is a basic implementation; can be enhanced with proper inflection library
    if resource.endswith("s") and len(resource) > 1:
        return resource[:-1]
    return resource


def resolve_resource_folder(meta, fallback: str | None = None) -> str:
    """
    Resolve the resource folder name from metadata.

    Priority:
    1. x-codegen.resource (if present)
    2. x-codegen.group (if present and not "shared")
    3. fallback parameter (if provided)
    4. Return empty string (caller should handle)

    This is the single source of truth for resource folder naming.
    """
    if meta:
        if meta.resource:
            return normalize_resource_folder(meta.resource)
        if meta.group and meta.group != "shared":
            return normalize_resource_folder(meta.group)
    if fallback:
        return normalize_resource_folder(fallback)
    return ""


def model_output_path(domain: str, schema_name: str) -> Path:
    """Generate path for model files using fixed file name and subfolder structure.

    Returns version-root-relative path like: models/{domain}/{schema_name}/model.dart
    """
    folder_name = snake_case(schema_name)
    return _DART_MODELS_ROOT / domain / folder_name / MODEL_FILE_NAME


def query_model_output_path(domain: str, schema_name: str) -> Path:
    """Generate path for query model files under models/{resource}/query/.

    Returns version-root-relative path like: models/{domain}/query/{schema_name}/model.dart
    """
    folder_name = snake_case(schema_name)
    return _DART_MODELS_ROOT / domain / "query" / folder_name / MODEL_FILE_NAME


def enum_output_path(domain: str, enum_name: str) -> Path:
    """Generate path for enum files under models/{resource}/enums/.

    Returns version-root-relative path like: models/{domain}/enums/{enum_name}/enum.dart
    """
    folder_name = snake_case(enum_name)
    return _DART_MODELS_ROOT / domain / DART_ENUMS_SUBFOLDER / folder_name / ENUM_FILE_NAME


def dto_body_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO body files using fixed file name.

    Returns version-root-relative path like: dtos/{group}/{operation}/body.dart
    """
    operation_folder = infer_operation_name(operation_name)
    return _DART_DTOS_ROOT / group / operation_folder / BODY_FILE_NAME


def shared_error_response_file(status_code: str) -> str:
    """Generate file name for shared error response based on status code."""
    return f"response_{status_code}.dart"


def shared_error_response_path(status_code: str) -> Path:
    """Generate path for shared error response DTOs.

    Returns version-root-relative path like: dtos/shared/responses/response_{status_code}.dart
    """
    file_name = shared_error_response_file(status_code)
    return _DART_DTOS_ROOT / DART_SHARED_FOLDER / "responses" / file_name


def dto_query_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO query files using fixed file name.

    Returns version-root-relative path like: dtos/{group}/{operation}/query.dart
    """
    operation_folder = infer_operation_name(operation_name)
    return _DART_DTOS_ROOT / group / operation_folder / QUERY_FILE_NAME


def dto_params_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO params files using fixed file name.

    Returns version-root-relative path like: dtos/{group}/{operation}/params.dart
    """
    operation_folder = infer_operation_name(operation_name)
    return _DART_DTOS_ROOT / group / operation_folder / PARAMS_FILE_NAME


def dto_response_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO response files using fixed file name.

    Returns version-root-relative path like: dtos/{group}/{operation}/response.dart
    """
    operation_folder = infer_operation_name(operation_name)
    return _DART_DTOS_ROOT / group / operation_folder / RESPONSE_FILE_NAME


def dto_fields_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO fields files using fixed file name.

    Returns version-root-relative path like: dtos/{group}/{operation}/fields.dart
    """
    operation_folder = infer_operation_name(operation_name)
    return _DART_DTOS_ROOT / group / operation_folder / FIELDS_FILE_NAME


def model_fields_output_path(domain: str, schema_name: str) -> Path:
    """Generate path for model fields files using fixed file name.

    Returns version-root-relative path like: models/{domain}/{schema_name}/fields.dart
    """
    model_folder = infer_model_domain(schema_name)
    folder_name = snake_case(schema_name)
    return _DART_MODELS_ROOT / model_folder / folder_name / FIELDS_FILE_NAME


def shared_dto_output_path(schema_name: str) -> Path:
    """Generate path for shared DTO files using fixed file name and subfolder structure.

    Returns version-root-relative path like: dtos/shared/{schema_name}/model.dart
    """
    folder_name = snake_case(schema_name)
    return _DART_DTOS_ROOT / DART_SHARED_FOLDER / folder_name / MODEL_FILE_NAME


def shared_dto_fields_output_path(schema_name: str) -> Path:
    """Generate path for shared DTO fields files using fixed file name.

    Returns version-root-relative path like: dtos/shared/{schema_name}/fields.dart
    """
    folder_name = snake_case(schema_name)
    return _DART_DTOS_ROOT / DART_SHARED_FOLDER / folder_name / FIELDS_FILE_NAME


# Legacy functions - to be replaced
def model_file_name(schema_name: str) -> str:
    """Generate file name for model schemas (no suffix)."""
    return DART_FILE_NAME_FORMAT.format(snake_case(schema_name), DART_FILE_EXTENSION)


def enum_file_name(schema_name: str) -> str:
    """Generate file name for enum schemas (no suffix)."""
    return DART_FILE_NAME_FORMAT.format(snake_case(schema_name), DART_FILE_EXTENSION)


def dto_file_name(schema_name: str) -> str:
    """Generate file name for DTO schemas (no suffix)."""
    return DART_FILE_NAME_FORMAT.format(snake_case(schema_name), DART_FILE_EXTENSION)


def fields_file_name(schema_name: str) -> str:
    """Generate file name for field-constant files (with _fields suffix)."""
    return DART_FILE_NAME_WITH_SUFFIX_FORMAT.format(snake_case(schema_name), DART_FIELDS_SUFFIX, DART_FILE_EXTENSION)


def schema_file_name(schema_name: str) -> str:
    """Legacy function - deprecated. Use specific file name functions."""
    return DART_FILE_NAME_FORMAT.format(snake_case(schema_name), DART_FILE_EXTENSION)


def model_path(schema_name: str, schema: dict | None = None) -> Path:
    domain = infer_model_domain(schema_name, schema)

    return Path(DartFolder.MODELS) / domain / model_file_name(schema_name)


def enum_path(schema_name: str, schema: dict | None = None) -> Path:
    domain = infer_enum_domain(schema_name, schema)

    return Path(DartFolder.ENUMS) / domain / enum_file_name(schema_name)


def dto_path(
    schema_name: str,
    usage: list[SchemaUsage] | None = None,
) -> Path:
    file_name = dto_file_name(schema_name)

    if usage:
        # Determine placement based on usage patterns
        unique_tags = set(u.tag for u in usage)
        unique_operations = set(u.operation_id for u in usage)

        if len(unique_operations) == 1:
            # Used by single operation -> place in operation folder
            single_usage = usage[0]
            group = infer_tag_domain(single_usage.tag)
            operation = infer_operation_name(single_usage.operation_id)
            return Path(DartFolder.DTOS) / group / operation / file_name
        elif len(unique_tags) == 1:
            # Used by multiple operations in same tag -> place in tag shared
            single_tag = list(unique_tags)[0]
            group = infer_tag_domain(single_tag)
            return Path(DartFolder.DTOS) / group / DART_SHARED_FOLDER / file_name
        else:
            # Used across multiple tags -> place in global shared
            return Path(DartFolder.DTOS) / DART_SHARED_FOLDER / file_name

    # No usage info -> place in global shared
    return Path(DartFolder.DTOS) / DART_SHARED_FOLDER / file_name


def operation_folder_path(tag: str, operation_id: str) -> Path:
    """Generate the operation-specific folder path for operation-owned files."""
    group = infer_tag_domain(tag)
    operation_name = infer_operation_name(operation_id)
    return Path(DartFolder.DTOS) / group / operation_name


def operation_params_path(tag: str, operation_id: str) -> Path:
    """Generate the path for operation params file."""
    operation_name = infer_operation_name(operation_id)
    return Path(f"{DART_SHARED_FOLDER}/{snake_case(operation_name)}{DART_PARAMS_SUFFIX}{DART_FILE_EXTENSION}")


def operation_fields_path(tag: str, operation_id: str, dart_name: str) -> Path:
    """Generate the path for operation fields file."""
    operation_folder = operation_folder_path(tag, operation_id)
    file_name = DART_FILE_NAME_WITH_SUFFIX_FORMAT.format(snake_case(dart_name), DART_FIELDS_SUFFIX, DART_FILE_EXTENSION)
    return operation_folder / file_name


def schema_output_path(
    schema_name: str,
    kind: SchemaKind,
    schema: dict | None = None,
    usage: list[SchemaUsage] | None = None,
) -> Path | None:
    """Generate version-root-relative output path based on schema kind and usage.

    Returns paths like: models/{domain}/{schema_name}/model.dart
    The version folder is prepended by the renderer at write time.
    """
    # Read x-codegen metadata for group/resource information
    meta = read_codegen_metadata(schema) if schema else None

    if kind == SchemaKind.MODEL:
        # Use centralized resource folder resolver
        domain = resolve_resource_folder(meta, fallback=infer_model_domain(schema_name))
        return model_output_path(domain, schema_name)

    if kind == SchemaKind.QUERY:
        # Query models go under models/{resource}/query/
        domain = resolve_resource_folder(meta, fallback=infer_model_domain(schema_name))
        return query_model_output_path(domain, schema_name)

    if kind == SchemaKind.ENUM:
        # Use centralized resource folder resolver
        domain = resolve_resource_folder(meta, fallback=infer_enum_domain(schema_name))
        return enum_output_path(domain, schema_name)

    if kind == SchemaKind.DTO:
        # Priority 1: Check if explicitly marked as shared
        if meta and (meta.group == "shared" or meta.shared):
            return shared_dto_output_path(schema_name)

        # Priority 2: Check if has x-codegen.resource/group for resource-specific placement
        resource_folder = resolve_resource_folder(meta)
        if resource_folder:
            return _DART_DTOS_ROOT / snake_case(resource_folder) / snake_case(schema_name) / "model.dart"

        # Priority 3: Operation-owned DTOs
        if usage:
            # Determine placement based on usage patterns
            unique_tags = set(u.tag for u in usage)
            unique_operations = set(u.operation_id for u in usage)

            if len(unique_operations) == 1:
                # Used by single operation - determine role from location
                single_usage = usage[0]
                # Use centralized resource folder resolver
                group = resolve_resource_folder(meta, fallback=infer_tag_domain(single_usage.tag))
                operation_name = infer_operation_name(single_usage.operation_id)

                if single_usage.location == DART_LOCATION_REQUEST_BODY:
                    return dto_body_output_path(group, operation_name)
                elif single_usage.location == DART_LOCATION_PARAMETER:
                    return dto_params_output_path(group, operation_name)
                elif single_usage.location == DART_LOCATION_RESPONSE:
                    return dto_response_output_path(group, operation_name)
                else:
                    return dto_query_output_path(group, operation_name)
            else:
                # Used by multiple operations - check if all in same resource
                if len(unique_tags) == 1:
                    # Same tag across multiple operations - use resource folder
                    resource_group = resolve_resource_folder(meta, fallback=infer_tag_domain(list(unique_tags)[0]))
                    return _DART_DTOS_ROOT / snake_case(resource_group) / snake_case(schema_name) / "model.dart"
                else:
                    # Mixed usage or across tags -> shared
                    return shared_dto_output_path(schema_name)
        else:
            # No usage info and no metadata -> shared fallback
            return shared_dto_output_path(schema_name)

    return None
