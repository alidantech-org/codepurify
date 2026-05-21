"""
SDK method/client operation planning from OpenAPI operations.

This module builds operation plans including method names, HTTP methods, paths,
parameters, request/response types, and auth requirements.

This module must not:
- render Dart code directly
- perform low-level Dart type conversion (call types.py)
- classify schemas (use classify.py)
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_DTOS_FOLDER,
    DART_FIELDS_CLASS_SUFFIX,
    DART_FILE_NAME_FORMAT,
    DART_PARAMS_CLASS_SUFFIX,
)
from constants.openapi_keys import (
    CONTENT_TYPE_APPLICATION_JSON,
    CONTENT_TYPE_APPLICATION_JSON_UTF8,
    HTTP_METHODS,
    OPENAPI_COMPONENTS,
    OPENAPI_CONTENT,
    OPENAPI_IN,
    OPENAPI_NAME,
    OPENAPI_OPERATION_ID,
    OPENAPI_PARAMETERS,
    OPENAPI_PATHS,
    OPENAPI_REF,
    OPENAPI_REQUEST_BODY,
    OPENAPI_REQUEST_BODIES,
    OPENAPI_RESPONSES,
    OPENAPI_SCHEMA,
    OPENAPI_TAGS,
    PARAM_LOCATION_COOKIE,
    PARAM_LOCATION_HEADER,
    PARAM_LOCATION_PATH,
    PARAM_LOCATION_QUERY,
    REF_PREFIX_COMPONENTS_PARAMETERS,
    REF_PREFIX_COMPONENTS_REQUEST_BODIES,
    REF_PREFIX_COMPONENTS_RESPONSES,
)
from .operation_usage import schema_ref_name
from ..domain.models import infer_tag_domain
from ..render.paths import dto_fields_output_path, dto_params_output_path
from utils.naming import pascal_case, snake_case

Schema = dict[str, Any]
OpenApiSpec = dict[str, Any]


@dataclass(frozen=True)
class OperationParam:
    """Detailed information about a single operation parameter."""

    name: str
    location: str  # "path", "query", "header", "cookie"
    required: bool
    source_component: str  # e.g., "UserIdPathParam", "PageQueryParam"
    schema_ref: str | None  # e.g., "#/components/schemas/UserStatus"
    schema_name: str | None  # e.g., "UserStatus"
    dart_type: str  # e.g., "String?", "UserStatus?"


@dataclass(frozen=True)
class OperationParamsPlan:
    params_class_name: str
    output_path: Path
    path_params: list[OperationParam]
    query_params: list[OperationParam]
    header_params: list[OperationParam]
    cookie_params: list[OperationParam]


@dataclass(frozen=True)
class OperationFieldsPlan:
    fields_class_name: str
    output_path: Path
    all_field_names: list[str]


@dataclass(frozen=True)
class OperationPlan:
    tag: str
    operation_id: str
    operation_folder: Path
    params_plan: OperationParamsPlan | None
    fields_plan: OperationFieldsPlan
    request_body_schema: str | None
    response_schemas: list[str]
    validation_errors: list[str]
    validation_warnings: list[str]


def build_operation_plans(spec: OpenApiSpec) -> dict[str, OperationPlan]:
    """Build operation plans for all operations in the spec."""
    operation_plans: dict[str, OperationPlan] = {}

    for path, path_item in spec.get(OPENAPI_PATHS, {}).items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            tags = operation.get(OPENAPI_TAGS) or ["Default"]
            tag = tags[0]
            operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")

            plan = build_single_operation_plan(tag, operation_id, path, path_item, operation, spec)
            operation_plans[operation_id] = plan

    return operation_plans


def build_single_operation_plan(
    tag: str,
    operation_id: str,
    path: str,
    path_item: dict[str, Any],
    operation: dict[str, Any],
    spec: OpenApiSpec,
) -> OperationPlan:
    """Build a single operation plan."""
    operation_folder = Path(DART_DTOS_FOLDER) / snake_case(tag) / snake_case(operation_id)

    # Collect parameters - merge path-level and operation-level with proper override logic
    path_params_map = {}
    query_params_map = {}
    header_params_map = {}
    cookie_params_map = {}

    # First, collect path-item parameters
    for param in path_item.get("parameters", []):
        if not isinstance(param, dict):
            continue

        param_def = resolve_parameter_ref(param, spec)
        param_name = param_def.get(OPENAPI_NAME, "")
        param_in = param_def.get(OPENAPI_IN, "")

        param_info = build_param_info(param_def, param, spec)
        key = (param_in, param_name)

        if param_in == PARAM_LOCATION_PATH:
            path_params_map[key] = param_info
        elif param_in == PARAM_LOCATION_QUERY:
            query_params_map[key] = param_info
        elif param_in == PARAM_LOCATION_HEADER:
            header_params_map[key] = param_info
        elif param_in == PARAM_LOCATION_COOKIE:
            cookie_params_map[key] = param_info

    # Then, collect operation-level parameters (these override path-level if same (in, name))
    for param in operation.get("parameters", []):
        if not isinstance(param, dict):
            continue

        param_def = resolve_parameter_ref(param, spec)
        param_name = param_def.get(OPENAPI_NAME, "")
        param_in = param_def.get(OPENAPI_IN, "")

        param_info = build_param_info(param_def, param, spec)
        key = (param_in, param_name)

        if param_in == PARAM_LOCATION_PATH:
            path_params_map[key] = param_info
        elif param_in == PARAM_LOCATION_QUERY:
            query_params_map[key] = param_info
        elif param_in == PARAM_LOCATION_HEADER:
            header_params_map[key] = param_info
        elif param_in == PARAM_LOCATION_COOKIE:
            cookie_params_map[key] = param_info

    # Convert maps to lists
    path_params = list(path_params_map.values())
    query_params = list(query_params_map.values())
    header_params = list(header_params_map.values())
    cookie_params = list(cookie_params_map.values())

    # Validate path variables have matching required path parameters
    path_errors = validate_path_variables(path, path_params)

    # Collect warnings
    warnings = []

    # Check if operation has params in OpenAPI but plan has none
    all_params = path_item.get("parameters", []) + operation.get("parameters", [])
    if all_params and not (path_params or query_params or header_params or cookie_params):
        warnings.append(f"Operation has parameters in OpenAPI but no params plan generated")

    # Normalize tag for path building
    normalized_tag = infer_tag_domain(tag)

    # Build params plan if any parameters exist
    params_plan = None
    if path_params or query_params or header_params or cookie_params:
        params_class_name = DART_FILE_NAME_FORMAT.format(pascal_case(operation_id), DART_PARAMS_CLASS_SUFFIX)
        params_plan = OperationParamsPlan(
            params_class_name=params_class_name,
            output_path=dto_params_output_path(normalized_tag, operation_id),
            path_params=path_params,
            query_params=query_params,
            header_params=header_params,
            cookie_params=cookie_params,
        )

    # Build fields plan
    fields_class_name = DART_FILE_NAME_FORMAT.format(pascal_case(operation_id), DART_FIELDS_CLASS_SUFFIX)
    all_field_names = [p.name for p in path_params + query_params + header_params + cookie_params]

    # Add field names from request body (follow component ref)
    request_body = operation.get(OPENAPI_REQUEST_BODY)
    request_body_schema = None
    if request_body:
        schema_ref = extract_schema_from_request_body(request_body, spec)
        if schema_ref:
            request_body_schema = schema_ref
        else:
            print(f"DEBUG: Failed to extract schema from request body for {operation_id}: {request_body}")

    # Add field names from responses (follow component refs)
    response_schemas = []
    responses = operation.get(OPENAPI_RESPONSES, {})
    for status, response in responses.items():
        if not isinstance(response, dict):
            continue

        schema_ref = extract_schema_from_response(response, spec)
        if schema_ref:
            response_schemas.append(schema_ref)
        else:
            print(f"DEBUG: Failed to extract schema from response {status} for {operation_id}")

    fields_plan = OperationFieldsPlan(
        fields_class_name=fields_class_name,
        output_path=dto_fields_output_path(normalized_tag, operation_id),
        all_field_names=all_field_names,
    )

    return OperationPlan(
        tag=tag,
        operation_id=operation_id,
        operation_folder=operation_folder,
        params_plan=params_plan,
        fields_plan=fields_plan,
        request_body_schema=request_body_schema,
        response_schemas=response_schemas,
        validation_errors=path_errors,
        validation_warnings=warnings,
    )


def extract_schema_from_request_body(request_body: dict[str, Any], spec: OpenApiSpec) -> str | None:
    """Extract schema ref from request body, following component references."""
    ref = request_body.get(OPENAPI_REF)
    if ref:
        if ref.startswith(REF_PREFIX_COMPONENTS_REQUEST_BODIES):
            request_body_name = ref.split("/")[-1]
            request_body_def = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_REQUEST_BODIES, {}).get(request_body_name)
            if request_body_def:
                content = request_body_def.get(OPENAPI_CONTENT, {})
                app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {}) or content.get(CONTENT_TYPE_APPLICATION_JSON_UTF8, {})
                schema = app_json.get(OPENAPI_SCHEMA, {})
                return schema_ref_name(schema)
        return None

    content = request_body.get(OPENAPI_CONTENT, {})
    if content:
        app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {}) or content.get(CONTENT_TYPE_APPLICATION_JSON_UTF8, {})
        schema = app_json.get(OPENAPI_SCHEMA, {})
        return schema_ref_name(schema)

    return None


def extract_schema_from_response(response: dict[str, Any], spec: OpenApiSpec) -> str | None:
    """Extract schema ref from response, following component references."""
    # Check if it's a component ref
    ref = response.get(OPENAPI_REF)
    if ref:
        if ref.startswith(REF_PREFIX_COMPONENTS_RESPONSES):
            response_name = ref.split("/")[-1]
            response_def = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_RESPONSES, {}).get(response_name)
            if response_def:
                content = response_def.get(OPENAPI_CONTENT, {})
                app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {}) or content.get(CONTENT_TYPE_APPLICATION_JSON_UTF8, {})
                schema = app_json.get(OPENAPI_SCHEMA, {})
                return schema_ref_name(schema)
        return None

    # Check direct content (inline schema)
    content = response.get(OPENAPI_CONTENT, {})
    if content:
        app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {}) or content.get(CONTENT_TYPE_APPLICATION_JSON_UTF8, {})
        schema = app_json.get(OPENAPI_SCHEMA, {})
        return schema_ref_name(schema)

    return None


def resolve_parameter_ref(param: dict[str, Any], spec: OpenApiSpec) -> dict[str, Any]:
    """Resolve a $ref parameter to its definition."""
    ref = param.get(OPENAPI_REF)
    if ref:
        if ref.startswith(REF_PREFIX_COMPONENTS_PARAMETERS):
            param_name = ref.split("/")[-1]
            param_def = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_PARAMETERS, {}).get(param_name)
            if param_def:
                return param_def
    return param


def build_param_info(param_def: dict[str, Any], param: dict[str, Any], spec: OpenApiSpec) -> OperationParam:
    """Build detailed parameter information including Dart type."""
    param_name = param_def.get(OPENAPI_NAME, "")
    param_in = param_def.get(OPENAPI_IN, "")
    required = param_def.get("required", False)
    schema = param_def.get(OPENAPI_SCHEMA, {})

    # Determine source component name
    source_component = param_name
    ref = param.get(OPENAPI_REF)
    if ref:
        if ref.startswith(REF_PREFIX_COMPONENTS_PARAMETERS):
            source_component = ref.split("/")[-1]

    # Extract schema info
    schema_ref = None
    schema_name = None
    if "$ref" in schema:
        schema_ref = schema["$ref"]
        if schema_ref.startswith("#/components/schemas/"):
            schema_name = schema_ref.split("/")[-1]

    # Resolve Dart type (using a simple approach for now)
    # TODO: Use proper type resolution with symbol_registry
    dart_type = "String?"  # Default fallback
    if schema:
        schema_type = schema.get("type")
        if schema_type == "integer":
            dart_type = "int?" if not required else "int"
        elif schema_type == "boolean":
            dart_type = "bool?" if not required else "bool"
        elif schema_type == "number":
            dart_type = "num?" if not required else "num"
        elif schema_type == "string":
            if schema_name:
                dart_type = f"{schema_name}?" if not required else schema_name
            else:
                dart_type = "String?" if not required else "String"
        elif schema_type == "array":
            dart_type = "List<String>?" if not required else "List<String>"

    return OperationParam(
        name=param_name,
        location=param_in,
        required=required,
        source_component=source_component,
        schema_ref=schema_ref,
        schema_name=schema_name,
        dart_type=dart_type,
    )


def validate_path_variables(path: str, path_params: list[OperationParam]) -> list[str]:
    """Validate that every {param} in the path has a matching required path parameter."""
    import re

    # Extract path variables from path template
    path_variables = set(re.findall(r"\{([^}]+)\}", path))

    # Get path parameter names
    path_param_names = {p.name for p in path_params}

    # Check for missing path params
    missing = path_variables - path_param_names

    # Check that all path params are required
    non_required = [p.name for p in path_params if not p.required]

    errors = []
    for var in missing:
        errors.append(f"Path variable '{var}' has no matching path parameter")
    for param_name in non_required:
        errors.append(f"Path parameter '{param_name}' is not required (path parameters must be required)")

    return errors
