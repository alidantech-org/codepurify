"""
Feature orchestrator planning.
"""

from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_BODY_TO_JSON_EXPR,
    DART_DEFAULT_TAG,
    DART_ENDPOINT_PARAM_ACCESS_FORMAT,
    DART_PARAMS_EXPR,
    DART_QUERY_TO_JSON_EXPR,
    DART_REQUEST_FALLBACK_CLASS,
    DART_STRING_PARAM_FORMAT,
)
from constants.dart_requests import HTTP_METHOD_TO_REQUEST_CLASS
from constants.features import (
    FEATURE_CLASS_SUFFIX,
    FEATURE_FILE_SUFFIX,
    FEATURE_PROVIDER_SUFFIX,
    FEATURES_DIR_NAME,
    FLUTTER_API_BRIDGE_IMPORT,
    RIVERPOD_IMPORT,
)
from constants.openapi_keys import (
    HTTP_METHOD_GET,
    OPENAPI_OPERATION_ID,
    OPENAPI_PATHS,
    OPENAPI_TAGS,
    SUPPORTED_OPERATION_METHODS,
)
from utils.naming import camel_case, pascal_case, snake_case
from ...type_system.imports import package_import
from ..feature_plan import DartFeatureMethodPlan, DartFeaturePlan
from ..route_plan import (
    DartEndpointGroupPlan,
    DartEndpointOperationPlan,
    DartRouteVersionPlan,
)

OpenApiSpec = dict[str, Any]


def build_feature_plans(
    spec: OpenApiSpec,
    class_plans: dict[str, Any],
    route_versions: list[DartRouteVersionPlan],
    version_folder: str = "latest",
    package_name: str = "riderescue_api",
) -> list[DartFeaturePlan]:
    """Build feature plans from OpenAPI operations and generated DTO plans."""
    paths = spec.get(OPENAPI_PATHS, {})
    if not isinstance(paths, dict):
        return []

    route_version = route_versions[0] if route_versions else None
    if not route_version:
        return []

    tag_groups = group_operations_by_tag(paths)

    return [
        build_feature_plan_for_tag(
            tag=tag,
            operations=operations,
            class_plans=class_plans,
            route_version=route_version,
            version_folder=version_folder,
            package_name=package_name,
        )
        for tag, operations in sorted(tag_groups.items())
    ]


def group_operations_by_tag(paths: dict) -> dict[str, list[dict]]:
    """Group OpenAPI operations by first tag."""
    tag_groups: dict[str, list[dict]] = {}

    for path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if method.lower() not in SUPPORTED_OPERATION_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            tags = operation.get(OPENAPI_TAGS, [])
            tag = tags[0] if isinstance(tags, list) and tags else DART_DEFAULT_TAG

            tag_groups.setdefault(tag, []).append(
                {
                    "operation": operation,
                    "method": method,
                    "path": path,
                }
            )

    return tag_groups


def build_feature_plan_for_tag(
    tag: str,
    operations: list[dict],
    class_plans: dict[str, Any],
    route_version: DartRouteVersionPlan,
    version_folder: str = "latest",
    package_name: str = "riderescue_api",
) -> DartFeaturePlan:
    """Build one feature file plan for a tag group."""
    group_snake = snake_case(tag)
    feature_class_name = f"{pascal_case(tag)}{FEATURE_CLASS_SUFFIX}"
    provider_name = f"{camel_case(group_snake)}{FEATURE_PROVIDER_SUFFIX}"
    feature_folder = Path(FEATURES_DIR_NAME)
    feature_file = f"{group_snake}{FEATURE_FILE_SUFFIX}"

    feature_imports = build_base_feature_imports(route_version, package_name, version_folder)
    methods: list[DartFeatureMethodPlan] = []

    for operation_data in operations:
        method_plan = build_feature_method_plan(
            operation_data=operation_data,
            class_plans=class_plans,
            route_version=route_version,
            tag=tag,
            package_name=package_name,
            version_folder=version_folder,
        )

        if method_plan:
            methods.append(method_plan)

    for method in methods:
        for import_uri in method.imports:
            if import_uri not in feature_imports:
                feature_imports.append(import_uri)

    return DartFeaturePlan(
        version_name=version_folder,
        group_name=tag,
        class_name=feature_class_name,
        provider_name=provider_name,
        folder=feature_folder,
        file_name=feature_file,
        imports=feature_imports,
        methods=methods,
    )


def build_feature_method_plan(
    operation_data: dict,
    class_plans: dict[str, Any],
    route_version: DartRouteVersionPlan,
    tag: str,
    package_name: str = "riderescue_api",
    version_folder: str = "latest",
) -> DartFeatureMethodPlan | None:
    """Build one feature method plan."""
    operation = operation_data["operation"]
    method = operation_data["method"]
    path = operation_data["path"]

    operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")
    http_method = method.upper()
    supports_cache_options = method.lower() == HTTP_METHOD_GET

    request_class = HTTP_METHOD_TO_REQUEST_CLASS.get(
        http_method,
        DART_REQUEST_FALLBACK_CLASS,
    )

    endpoint_group = find_endpoint_group(route_version, tag)
    if not endpoint_group:
        return None

    endpoint_op = find_endpoint_operation(endpoint_group, operation_id)
    if not endpoint_op:
        return None

    params_plan_key = f"{operation_id}_params" if not endpoint_op.is_getter else None
    query_plan_key = f"{operation_id}_query"
    body_plan_key = f"{operation_id}_body"
    response_plan_key = f"{operation_id}_response"

    params_plan = class_plans.get(params_plan_key) if params_plan_key else None
    query_plan = class_plans.get(query_plan_key)
    body_plan = class_plans.get(body_plan_key)
    response_plan = class_plans.get(response_plan_key)

    if not response_plan:
        return None

    endpoint_expr = build_endpoint_expr(
        route_version=route_version,
        endpoint_group=endpoint_group,
        endpoint_op=endpoint_op,
        params_plan=params_plan,
    )

    imports = build_method_imports(
        class_plans=[
            params_plan,
            query_plan,
            body_plan,
            response_plan,
        ],
        package_name=package_name,
        version_folder=version_folder,
    )

    signature = build_method_signature(
        method_name=operation_id,
        response_class=response_plan.class_name,
        endpoint_op=endpoint_op,
        params_plan=params_plan,
        query_plan=query_plan,
        body_plan=body_plan,
        supports_cache_options=supports_cache_options,
    )

    return DartFeatureMethodPlan(
        operation_id=operation_id,
        method_name=operation_id,
        http_method=http_method,
        request_class=request_class,
        response_class=response_plan.class_name,
        endpoint_expr=endpoint_expr,
        body_expr=DART_BODY_TO_JSON_EXPR if body_plan else None,
        query_expr=DART_QUERY_TO_JSON_EXPR if query_plan else None,
        params_expr=DART_PARAMS_EXPR if params_plan else None,
        supports_request_options=True,
        supports_cache_options=supports_cache_options,
        imports=imports,
        signature=signature,
    )


def build_base_feature_imports(
    route_version: DartRouteVersionPlan,
    package_name: str,
    version_folder: str,
) -> list[str]:
    """Build common imports for every feature file."""
    return [
        FLUTTER_API_BRIDGE_IMPORT,
        RIVERPOD_IMPORT,
        package_import(
            package_name,
            version_folder,
            Path("routes"),
            f"{route_version.version_name}.dart",
        ),
    ]


def find_endpoint_group(
    route_version: DartRouteVersionPlan,
    tag: str,
) -> DartEndpointGroupPlan | None:
    """Find endpoint group by tag."""
    for group in route_version.endpoint_groups:
        if group.group_name == tag:
            return group

    return None


def find_endpoint_operation(
    endpoint_group: DartEndpointGroupPlan,
    operation_id: str,
) -> DartEndpointOperationPlan | None:
    """Find endpoint operation by operationId."""
    for operation in endpoint_group.operations:
        if operation.operation_id == operation_id:
            return operation

    return None


def build_endpoint_expr(
    route_version: DartRouteVersionPlan,
    endpoint_group: DartEndpointGroupPlan,
    endpoint_op: DartEndpointOperationPlan,
    params_plan: Any | None,
) -> str:
    """Build feature method endpoint expression."""
    base_expr = f"{route_version.class_name}." f"{endpoint_group.property_name}." f"{endpoint_op.method_name}"

    if endpoint_op.is_getter:
        return base_expr

    if params_plan:
        params_str = ", ".join(DART_ENDPOINT_PARAM_ACCESS_FORMAT.format(param) for param in endpoint_op.path_params)
    else:
        params_str = ", ".join(endpoint_op.path_params)

    return f"{base_expr}({params_str})"


def build_method_imports(
    class_plans: list[Any | None],
    package_name: str = "riderescue_api",
    version_folder: str = "latest",
) -> list[str]:
    """Build imports for DTO classes used by a feature method."""
    imports: list[str] = []

    for plan in class_plans:
        if not plan:
            continue

        # Use artifact_folder from the plan to build versioned import
        artifact_folder = plan.artifact_folder if hasattr(plan, "artifact_folder") else plan.model_path.parent
        imports.append(
            package_import(
                package_name,
                version_folder,
                artifact_folder,
                "index.dart",
            )
        )

    return sorted(set(imports))


def build_method_signature(
    method_name: str,
    response_class: str,
    endpoint_op: DartEndpointOperationPlan,
    params_plan: Any | None,
    query_plan: Any | None,
    body_plan: Any | None,
    supports_cache_options: bool,
) -> str:
    """
    Build Dart feature method signature.

    Rule:
    - params -> named required
    - body -> named required
    - query -> named optional
    - all methods -> headers/noAuth
    - GET methods -> cache options
    """
    return_type = f"Future<ApiResult<{response_class}>>"
    named_params = build_named_method_params(
        endpoint_op=endpoint_op,
        params_plan=params_plan,
        query_plan=query_plan,
        body_plan=body_plan,
        supports_cache_options=supports_cache_options,
    )

    if not named_params:
        return f"{return_type} {method_name}()"

    params_str = ",\n    ".join(named_params)

    return f"{return_type} {method_name}({{\n" f"    {params_str},\n" f"  }})"


def build_named_method_params(
    endpoint_op: DartEndpointOperationPlan,
    params_plan: Any | None,
    query_plan: Any | None,
    body_plan: Any | None,
    supports_cache_options: bool,
) -> list[str]:
    """Build named Dart method parameters for feature methods."""
    params: list[str] = []

    if params_plan:
        params.append(f"required {params_plan.class_name} params")
    elif endpoint_op.path_params:
        params.extend(f"required {DART_STRING_PARAM_FORMAT.format(param)}" for param in endpoint_op.path_params)

    if body_plan:
        params.append(f"required {body_plan.class_name} body")

    if query_plan:
        params.append(f"{query_plan.class_name}? query")

    params.extend(build_request_option_params(supports_cache_options))

    return params


def build_request_option_params(supports_cache_options: bool) -> list[str]:
    """Build request options supported by all feature methods."""
    if supports_cache_options:
        return ["ApiGetRequestOptions? options"]
    return ["ApiRequestOptions? options"]
