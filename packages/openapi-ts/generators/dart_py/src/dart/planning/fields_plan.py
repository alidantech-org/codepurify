"""
Fields file generation planning for reusable field constants.

This module builds plans for generated fields.dart files that contain
field name constants used across the SDK.

This module must not:
- render templates directly (unless project keeps all plan rendering in plan files)
- decide full class structure
- inspect route operation behavior beyond field extraction
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_FILE_EXTENSION,
    DART_DTOS_FOLDER,
    DART_FIELDS_CLASS_SUFFIX,
    DART_FIELDS_SUFFIX,
    DART_FILE_NAME_FORMAT,
    DART_PATH_FORMAT_DOMAIN_FIELDS,
    DART_PATH_FORMAT_OPERATION_FIELDS,
    DART_PATH_FORMAT_SDK_GROUP_FIELDS,
    DART_MODELS_FOLDER,
)
from constants.openapi_keys import (
    CONTENT_TYPE_APPLICATION_JSON,
    HTTP_METHODS,
    OPENAPI_COMPONENTS,
    OPENAPI_CONTENT,
    OPENAPI_NAME,
    OPENAPI_OPERATION_ID,
    OPENAPI_PARAMETERS,
    OPENAPI_PATHS,
    OPENAPI_PROPERTIES,
    OPENAPI_REF,
    OPENAPI_REQUEST_BODY,
    OPENAPI_RESPONSES,
    OPENAPI_SCHEMAS,
    REF_PREFIX_COMPONENTS_PARAMETERS,
    REF_PREFIX_COMPONENTS_SCHEMAS,
    STATUS_CODE_CREATED,
    STATUS_CODE_OK,
)
from constants.sdk_tags import X_SDK_GROUP

Schema = dict[str, Any]


@dataclass(frozen=True)
class DartFieldConstant:
    dart_name: str
    wire_name: str


@dataclass(frozen=True)
class DartFieldsPlan:
    class_name: str
    output_path: Path
    description: str
    fields: list[DartFieldConstant]


def build_model_fields_plan(
    domain: str,
    schema_names: list[str],
    spec: Schema,
    output_dir: Path,
) -> DartFieldsPlan:
    """Build a fields plan for a model domain by combining fields from multiple schemas."""
    from dart.registry import build_schema_registry

    registry = build_schema_registry(spec)

    # Collect all fields from the schemas
    field_set = {}

    for schema_name in schema_names:
        if schema_name not in registry:
            continue

        schema = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_SCHEMAS, {}).get(schema_name, {})

        # Extract fields from the schema properties
        properties = schema.get(OPENAPI_PROPERTIES, {})
        for prop_name, _ in properties.items():
            dart_name = to_field_name(prop_name)
            wire_name = prop_name
            field_set[wire_name] = DartFieldConstant(dart_name=dart_name, wire_name=wire_name)

    # Sort fields: required first, then optional, then alphabetical
    fields = list(field_set.values())
    fields.sort(key=lambda f: f.wire_name)

    class_name = DART_FILE_NAME_FORMAT.format(domain.title(), DART_FIELDS_CLASS_SUFFIX)
    output_path = Path(DART_PATH_FORMAT_DOMAIN_FIELDS.format(DART_MODELS_FOLDER, domain, DART_FIELDS_SUFFIX, DART_FILE_EXTENSION))

    return DartFieldsPlan(
        class_name=class_name,
        output_path=output_path,
        description=f"Field constants for {domain} models.",
        fields=fields,
    )


def build_operation_fields_plan(
    operation_id: str,
    spec: Schema,
    output_dir: Path,
) -> DartFieldsPlan:
    """Build a fields plan for an operation by combining params, body, and response fields."""
    from utils.naming import snake_case

    # Find the operation
    operation = None
    for _, path_item in spec.get(OPENAPI_PATHS, {}).items():
        for method, op in path_item.items():
            if method.upper() in HTTP_METHODS:
                if op.get(OPENAPI_OPERATION_ID) == operation_id:
                    operation = op
                    break
        if operation:
            break

    if not operation:
        raise ValueError(f"Operation {operation_id} not found")

    field_set = {}
    parameters = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_PARAMETERS, {})

    # Collect parameters (dereference if needed)
    for param in operation.get(OPENAPI_PARAMETERS, []):
        if OPENAPI_REF in param:
            ref = param[OPENAPI_REF]
            if ref.startswith(REF_PREFIX_COMPONENTS_PARAMETERS):
                param_name = ref.split("/")[-1]
                param_def = parameters.get(param_name, {})
                name = param_def.get(OPENAPI_NAME)
                dart_name = to_field_name(name)
                field_set[name] = DartFieldConstant(dart_name=dart_name, wire_name=name)
        else:
            name = param.get(OPENAPI_NAME)
            dart_name = to_field_name(name)
            field_set[name] = DartFieldConstant(dart_name=dart_name, wire_name=name)

    # Collect request body fields
    request_body = operation.get(OPENAPI_REQUEST_BODY)
    if request_body:
        content = request_body.get(OPENAPI_CONTENT, {})
        json_content = content.get(CONTENT_TYPE_APPLICATION_JSON, {})
        schema_ref = json_content.get(OPENAPI_REF, "")
        if schema_ref.startswith(REF_PREFIX_COMPONENTS_SCHEMAS):
            schema_name = schema_ref.split("/")[-1]
            schema = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_SCHEMAS, {}).get(schema_name, {})
            properties = schema.get(OPENAPI_PROPERTIES, {})
            for prop_name, _ in properties.items():
                dart_name = to_field_name(prop_name)
                field_set[prop_name] = DartFieldConstant(dart_name=dart_name, wire_name=prop_name)

    # Collect success response fields
    responses = operation.get(OPENAPI_RESPONSES, {})
    success_response = responses.get(STATUS_CODE_OK) or responses.get(STATUS_CODE_CREATED)
    if success_response:
        content = success_response.get(OPENAPI_CONTENT, {})
        json_content = content.get(CONTENT_TYPE_APPLICATION_JSON, {})
        schema_ref = json_content.get(OPENAPI_REF, "")
        if schema_ref.startswith(REF_PREFIX_COMPONENTS_SCHEMAS):
            schema_name = schema_ref.split("/")[-1]
            schema = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_SCHEMAS, {}).get(schema_name, {})
            properties = schema.get(OPENAPI_PROPERTIES, {})
            for prop_name, _ in properties.items():
                dart_name = to_field_name(prop_name)
                field_set[prop_name] = DartFieldConstant(dart_name=dart_name, wire_name=prop_name)

    # Sort fields alphabetically
    fields = list(field_set.values())
    fields.sort(key=lambda f: f.wire_name)

    class_name = DART_FILE_NAME_FORMAT.format(snake_case(operation_id), DART_FIELDS_CLASS_SUFFIX)
    operation_snake = snake_case(operation_id)

    # Use x-sdk-group for grouping
    sdk_group = operation.get(X_SDK_GROUP, "")
    if sdk_group:
        output_path = Path(
            DART_PATH_FORMAT_SDK_GROUP_FIELDS.format(DART_DTOS_FOLDER, sdk_group, operation_snake, DART_FIELDS_SUFFIX, DART_FILE_EXTENSION)
        )
    else:
        output_path = Path(
            DART_PATH_FORMAT_OPERATION_FIELDS.format(DART_DTOS_FOLDER, operation_snake, DART_FIELDS_SUFFIX, DART_FILE_EXTENSION)
        )

    return DartFieldsPlan(
        class_name=class_name,
        output_path=output_path,
        description=f"Field constants for the {operation_id} operation.",
        fields=fields,
    )


def to_field_name(name: str) -> str:
    """Convert a wire name to a Dart field name."""
    return name
