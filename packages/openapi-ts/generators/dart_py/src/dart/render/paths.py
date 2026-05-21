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

from constants.dart_syntax import (
    BODY_FILE_NAME,
    DART_DTOS_FOLDER,
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
from ..domain.models import infer_enum_domain, infer_model_domain, infer_operation_name, infer_tag_domain
from ..domain.kinds import DartFolder, SchemaKind
from ..planning.operation_usage import SchemaUsage
from utils.naming import snake_case


def model_output_path(domain: str, schema_name: str) -> Path:
    """Generate path for model files using fixed file name and subfolder structure."""
    folder_name = snake_case(schema_name)
    return Path(DART_MODELS_FOLDER) / domain / folder_name / MODEL_FILE_NAME


def enum_output_path(domain: str, enum_name: str) -> Path:
    """Generate path for enum files using fixed file name (enum.dart)."""
    folder_name = snake_case(enum_name)
    return Path(DartFolder.ENUMS) / folder_name / ENUM_FILE_NAME


def dto_body_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO body files using fixed file name."""
    operation_folder = infer_operation_name(operation_name)
    return Path(DART_DTOS_FOLDER) / group / operation_folder / BODY_FILE_NAME


def shared_error_response_file(status_code: str) -> str:
    """Generate file name for shared error response based on status code."""
    return f"response_{status_code}.dart"


def shared_error_response_path(status_code: str) -> Path:
    """Generate path for shared error response DTOs."""
    file_name = shared_error_response_file(status_code)
    return Path(DART_DTOS_FOLDER) / DART_SHARED_FOLDER / "responses" / file_name


def dto_query_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO query files using fixed file name."""
    operation_folder = infer_operation_name(operation_name)
    return Path(DART_DTOS_FOLDER) / group / operation_folder / QUERY_FILE_NAME


def dto_params_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO params files using fixed file name."""
    operation_folder = infer_operation_name(operation_name)
    return Path(DART_DTOS_FOLDER) / group / operation_folder / PARAMS_FILE_NAME


def dto_response_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO response files using fixed file name."""
    operation_folder = infer_operation_name(operation_name)
    return Path(DART_DTOS_FOLDER) / group / operation_folder / RESPONSE_FILE_NAME


def dto_fields_output_path(group: str, operation_name: str) -> Path:
    """Generate path for DTO fields files using fixed file name."""
    operation_folder = infer_operation_name(operation_name)
    return Path(DART_DTOS_FOLDER) / group / operation_folder / FIELDS_FILE_NAME


def model_fields_output_path(domain: str, schema_name: str) -> Path:
    """Generate path for model fields files using fixed file name."""
    model_folder = infer_model_domain(schema_name)
    folder_name = snake_case(schema_name)
    return Path(DART_MODELS_FOLDER) / model_folder / folder_name / FIELDS_FILE_NAME


def shared_dto_output_path(schema_name: str) -> Path:
    """Generate path for shared DTO files using fixed file name and subfolder structure."""
    folder_name = snake_case(schema_name)
    return Path(DART_DTOS_FOLDER) / DART_SHARED_FOLDER / folder_name / MODEL_FILE_NAME


def shared_dto_fields_output_path(schema_name: str) -> Path:
    """Generate path for shared DTO fields files using fixed file name."""
    folder_name = snake_case(schema_name)
    return Path(DART_DTOS_FOLDER) / DART_SHARED_FOLDER / folder_name / FIELDS_FILE_NAME


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
    """Generate output path based on schema kind and usage."""
    if kind == SchemaKind.MODEL:
        domain = infer_model_domain(schema_name)
        return model_output_path(domain, schema_name)

    if kind == SchemaKind.ENUM:
        domain = infer_enum_domain(schema_name)
        return enum_output_path(domain, schema_name)

    if kind == SchemaKind.DTO:
        if usage:
            # Determine placement based on usage patterns
            unique_tags = set(u.tag for u in usage)
            unique_operations = set(u.operation_id for u in usage)
            unique_locations = set(u.location for u in usage)

            if len(unique_operations) == 1:
                # Used by single operation - determine role from location
                single_usage = usage[0]
                group = infer_tag_domain(single_usage.tag)
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
                # Used by multiple operations or shared
                if len(unique_tags) == 1 and len(unique_locations) == 1:
                    # Same location across multiple operations in same tag
                    location = list(unique_locations)[0]
                    if location == DART_LOCATION_REQUEST_BODY:
                        return shared_dto_output_path(schema_name)
                    elif location == DART_LOCATION_RESPONSE:
                        return shared_dto_output_path(schema_name)
                    else:
                        return shared_dto_output_path(schema_name)
                else:
                    # Mixed usage or across tags -> shared
                    return shared_dto_output_path(schema_name)
        else:
            # No usage info -> shared
            return shared_dto_output_path(schema_name)

    return None
