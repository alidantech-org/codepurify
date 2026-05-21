"""
Main Dart generation plan builder.

This module coordinates the planning flow:
OpenAPI spec -> symbol registry -> usage -> class/enum plans -> routes/features/barrels.
"""

from typing import Any

from constants.openapi_keys import (
    OPENAPI_COMPONENTS,
    OPENAPI_NAME,
    OPENAPI_OPERATION_ID,
    OPENAPI_PATHS,
    OPENAPI_REQUEST_BODY,
    OPENAPI_REQUIRED,
    OPENAPI_RESPONSES,
    OPENAPI_SCHEMA,
    OPENAPI_SCHEMAS,
    OPENAPI_TAGS,
    OPENAPI_TYPE,
    OPENAPI_TYPE_STRING,
    PARAM_LOCATION_PATH,
    PARAM_LOCATION_QUERY,
    SUPPORTED_OPERATION_METHODS,
)
from constants.sdk_usage import (
    SDK_BODY_SCHEMA_SUFFIX,
    SDK_PARAMS_SCHEMA_SUFFIX,
    SDK_QUERY_SCHEMA_SUFFIX,
    SDK_RESPONSE_SCHEMA_SUFFIX,
    SDK_SHARED_ERROR_SCHEMA_PREFIX,
    SDK_USAGE_BODY,
    SDK_USAGE_PARAMS,
    SDK_USAGE_QUERY,
    SDK_USAGE_RESPONSE,
    SDK_USAGE_SHARED_ERROR,
)
from dart.registry import DartSymbol, build_schema_registry
from utils.naming import pascal_case
from ...domain.kinds import SchemaKind
from ...domain.models import infer_operation_name, infer_tag_domain
from ...render.paths import (
    dto_body_output_path,
    dto_params_output_path,
    dto_query_output_path,
    dto_response_output_path,
    shared_error_response_path,
)
from ..class_plan import build_class_plan
from ..enum_plan import build_enum_plan
from ..operation_usage import (
    collect_schema_usage,
    extract_schema_from_request_body,
    extract_schema_from_response,
)
from .barrels import build_barrel_plans
from .features import build_feature_plans
from .models import DartGenerationPlan
from .parameters import extract_parameters
from .routes import build_route_plans
from .shared_errors import collect_shared_error_responses, is_success_status
from .usage import determine_usage_type

Schema = dict[str, Any]
OpenApiSpec = dict[str, Any]


def build_dart_plans(
    spec: OpenApiSpec,
    package_name: str,
) -> DartGenerationPlan:
    """Build the full Dart generation plan."""
    symbol_registry = build_schema_registry(spec)
    usage_by_schema = collect_schema_usage(spec)
    shared_error_responses = collect_shared_error_responses(spec)

    schemas = get_component_schemas(spec)
    paths = get_paths(spec)

    class_plans: dict[str, Any] = {}
    enum_plans: dict[str, Any] = {}

    build_component_plans(
        schemas=schemas,
        symbol_registry=symbol_registry,
        usage_by_schema=usage_by_schema,
        package_name=package_name,
        class_plans=class_plans,
        enum_plans=enum_plans,
    )

    build_operation_dto_plans(
        paths=paths,
        schemas=schemas,
        symbol_registry=symbol_registry,
        package_name=package_name,
        class_plans=class_plans,
        spec=spec,
    )

    build_shared_error_plans(
        schemas=schemas,
        shared_error_responses=shared_error_responses,
        symbol_registry=symbol_registry,
        package_name=package_name,
        class_plans=class_plans,
    )

    route_versions = build_route_plans(spec, class_plans)
    features = build_feature_plans(spec, class_plans, route_versions)
    barrels = build_barrel_plans(class_plans, enum_plans, features)

    return DartGenerationPlan(
        classes=class_plans,
        enums=enum_plans,
        barrels=barrels,
        route_versions=route_versions,
        features=features,
    )


def build_component_plans(
    schemas: dict[str, Schema],
    symbol_registry: dict[str, DartSymbol],
    usage_by_schema: dict[str, list[Any]],
    package_name: str,
    class_plans: dict[str, Any],
    enum_plans: dict[str, Any],
) -> None:
    """Build plans for reusable component schemas."""
    for schema_name, schema in sorted(schemas.items()):
        symbol = symbol_registry.get(schema_name)

        if not symbol or not symbol.is_generated_file:
            continue

        schema_usage = usage_by_schema.get(schema_name, [])
        usage_operations = [usage.operation_id for usage in schema_usage]
        usage_type = determine_usage_type(schema_usage, symbol.kind)

        if symbol.kind == SchemaKind.ENUM:
            enum_plans[schema_name] = build_enum_plan(schema_name, schema, symbol)
            continue

        if symbol.kind in {SchemaKind.MODEL, SchemaKind.DTO}:
            class_plans[schema_name] = build_class_plan(
                schema_name=schema_name,
                schema=schema,
                symbol=symbol,
                symbol_registry=symbol_registry,
                package_name=package_name,
                usage=usage_operations,
                usage_type=usage_type,
            )


def build_operation_dto_plans(
    paths: dict[str, Any],
    schemas: dict[str, Schema],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    class_plans: dict[str, Any],
    spec: OpenApiSpec,
) -> None:
    """Build query/params/body/response operation-specific DTO plans."""
    for path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if method.lower() not in SUPPORTED_OPERATION_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            operation_context = build_operation_context(
                path=path,
                method=method,
                operation=operation,
            )

            build_query_plan(
                spec=spec,
                operation=operation,
                path_item=path_item,
                context=operation_context,
                symbol_registry=symbol_registry,
                package_name=package_name,
                class_plans=class_plans,
            )

            build_params_plan(
                spec=spec,
                operation=operation,
                path_item=path_item,
                context=operation_context,
                symbol_registry=symbol_registry,
                package_name=package_name,
                class_plans=class_plans,
            )

            build_body_plan(
                operation=operation,
                schemas=schemas,
                spec=spec,
                context=operation_context,
                symbol_registry=symbol_registry,
                package_name=package_name,
                class_plans=class_plans,
            )

            build_response_plans(
                operation=operation,
                schemas=schemas,
                spec=spec,
                context=operation_context,
                symbol_registry=symbol_registry,
                package_name=package_name,
                class_plans=class_plans,
            )


def build_operation_context(
    path: str,
    method: str,
    operation: dict,
) -> dict[str, str]:
    """Build operation naming context."""
    operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")

    tags = operation.get(OPENAPI_TAGS, [])
    tag = tags[0] if isinstance(tags, list) and tags else "default"

    return {
        "operation_id": operation_id,
        "group": infer_tag_domain(tag),
        "operation_name": infer_operation_name(operation_id),
    }


def build_query_plan(
    spec: OpenApiSpec,
    operation: dict,
    path_item: dict,
    context: dict[str, str],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    class_plans: dict[str, Any],
) -> None:
    """Build operation query DTO plan."""
    query_params = extract_parameters(spec, operation, path_item, PARAM_LOCATION_QUERY)

    if not query_params:
        return

    operation_id = context["operation_id"]
    schema_name = f"{operation_id}{SDK_QUERY_SCHEMA_SUFFIX}"

    query_symbol = DartSymbol(
        schema_name=schema_name,
        dart_name=f"{pascal_case(operation_id)}Query",
        kind=SchemaKind.DTO,
        path=dto_query_output_path(context["group"], context["operation_name"]),
    )

    query_schema = build_schema_from_parameters(query_params)

    class_plans[schema_name] = build_class_plan(
        schema_name=schema_name,
        schema=query_schema,
        symbol=query_symbol,
        symbol_registry=symbol_registry,
        package_name=package_name,
        usage=[operation_id],
        usage_type=SDK_USAGE_QUERY,
        operation_id=operation_id,
        is_shared=False,
    )


def build_params_plan(
    spec: OpenApiSpec,
    operation: dict,
    path_item: dict,
    context: dict[str, str],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    class_plans: dict[str, Any],
) -> None:
    """Build operation path params DTO plan."""
    path_params = extract_parameters(spec, operation, path_item, PARAM_LOCATION_PATH)

    if not path_params:
        return

    operation_id = context["operation_id"]
    schema_name = f"{operation_id}{SDK_PARAMS_SCHEMA_SUFFIX}"

    params_symbol = DartSymbol(
        schema_name=schema_name,
        dart_name=f"{pascal_case(operation_id)}Params",
        kind=SchemaKind.DTO,
        path=dto_params_output_path(context["group"], context["operation_name"]),
    )

    params_schema = build_schema_from_parameters(path_params)

    class_plans[schema_name] = build_class_plan(
        schema_name=schema_name,
        schema=params_schema,
        symbol=params_symbol,
        symbol_registry=symbol_registry,
        package_name=package_name,
        usage=[operation_id],
        usage_type=SDK_USAGE_PARAMS,
        operation_id=operation_id,
        is_shared=False,
    )


def build_body_plan(
    operation: dict,
    schemas: dict[str, Schema],
    spec: OpenApiSpec,
    context: dict[str, str],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    class_plans: dict[str, Any],
) -> None:
    """Build operation body DTO plan."""
    request_body = operation.get(OPENAPI_REQUEST_BODY)

    if not request_body:
        return

    schema_ref = extract_schema_from_request_body(request_body, spec)
    if not schema_ref:
        return

    operation_id = context["operation_id"]
    plan_key = f"{operation_id}{SDK_BODY_SCHEMA_SUFFIX}"

    class_plans.pop(schema_ref, None)

    body_symbol = DartSymbol(
        schema_name=schema_ref,
        dart_name=pascal_case(schema_ref),
        kind=SchemaKind.DTO,
        path=dto_body_output_path(context["group"], context["operation_name"]),
    )

    class_plans[plan_key] = build_class_plan(
        schema_name=schema_ref,
        schema=schemas.get(schema_ref, {}),
        symbol=body_symbol,
        symbol_registry=symbol_registry,
        package_name=package_name,
        usage=[operation_id],
        usage_type=SDK_USAGE_BODY,
        operation_id=operation_id,
        source_schema=schema_ref,
        is_shared=False,
    )


def build_response_plans(
    operation: dict,
    schemas: dict[str, Schema],
    spec: OpenApiSpec,
    context: dict[str, str],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    class_plans: dict[str, Any],
) -> None:
    """Build operation success response DTO plans."""
    responses = operation.get(OPENAPI_RESPONSES, {})
    if not isinstance(responses, dict):
        return

    operation_id = context["operation_id"]

    for status_code, response in responses.items():
        if not isinstance(status_code, str):
            continue

        if not isinstance(response, dict):
            continue

        if not is_success_status(status_code):
            continue

        schema_ref = extract_schema_from_response(response, spec)
        if not schema_ref:
            continue

        plan_key = f"{operation_id}{SDK_RESPONSE_SCHEMA_SUFFIX}"

        response_symbol = DartSymbol(
            schema_name=plan_key,
            dart_name=f"{pascal_case(operation_id)}Response",
            kind=SchemaKind.DTO,
            path=dto_response_output_path(context["group"], context["operation_name"]),
        )

        class_plans[plan_key] = build_class_plan(
            schema_name=plan_key,
            schema=schemas.get(schema_ref, {}),
            symbol=response_symbol,
            symbol_registry=symbol_registry,
            package_name=package_name,
            usage=[operation_id],
            usage_type=SDK_USAGE_RESPONSE,
            operation_id=operation_id,
            status_code=status_code,
            source_schema=schema_ref,
            is_shared=False,
        )


def build_shared_error_plans(
    schemas: dict[str, Schema],
    shared_error_responses: dict[str, tuple[str, str]],
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    class_plans: dict[str, Any],
) -> None:
    """Build deduped shared error DTO plans."""
    for _key, (status_code, schema_name) in shared_error_responses.items():
        plan_key = f"{SDK_SHARED_ERROR_SCHEMA_PREFIX}{status_code}"

        error_symbol = DartSymbol(
            schema_name=plan_key,
            dart_name=pascal_case(schema_name),
            kind=SchemaKind.DTO,
            path=shared_error_response_path(status_code),
        )

        class_plans[plan_key] = build_class_plan(
            schema_name=plan_key,
            schema=schemas.get(schema_name, {}),
            symbol=error_symbol,
            symbol_registry=symbol_registry,
            package_name=package_name,
            usage=[],
            usage_type=SDK_USAGE_SHARED_ERROR,
            operation_id=None,
            status_code=status_code,
            source_schema=schema_name,
            is_shared=True,
        )


def build_schema_from_parameters(parameters: list[dict]) -> Schema:
    """Build an object schema from OpenAPI parameters."""
    schema: Schema = {
        "type": "object",
        "properties": {},
        "required": [],
    }

    properties = schema["properties"]
    required = schema["required"]

    for param in parameters:
        param_name = param.get(OPENAPI_NAME)
        if not isinstance(param_name, str) or not param_name:
            continue

        param_schema = param.get(
            OPENAPI_SCHEMA,
            {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
        )

        if not isinstance(param_schema, dict):
            param_schema = {OPENAPI_TYPE: OPENAPI_TYPE_STRING}

        properties[param_name] = param_schema

        if param.get(OPENAPI_REQUIRED, False):
            required.append(param_name)

    return schema


def get_component_schemas(spec: OpenApiSpec) -> dict[str, Schema]:
    """Get OpenAPI component schemas safely."""
    components = spec.get(OPENAPI_COMPONENTS, {})
    if not isinstance(components, dict):
        return {}

    schemas = components.get(OPENAPI_SCHEMAS, {})
    if not isinstance(schemas, dict):
        return {}

    return schemas


def get_paths(spec: OpenApiSpec) -> dict[str, Any]:
    """Get OpenAPI paths safely."""
    paths = spec.get(OPENAPI_PATHS, {})
    if not isinstance(paths, dict):
        return {}

    return paths
