"""
Dart route planning.

This module contains logic for building route version and endpoint group plans
from the OpenAPI specification.
"""

from pathlib import Path
from typing import Any
import re

from constants.openapi_keys import (
    OPENAPI_OPERATION_ID,
    OPENAPI_PARAMETERS,
    OPENAPI_PATHS,
    OPENAPI_REF,
    REF_PREFIX_COMPONENTS_PARAMETERS,
    SUPPORTED_OPERATION_METHODS,
)
from constants.routes import (
    ENDPOINTS_CLASS_SUFFIX,
    ENDPOINTS_FILE_SUFFIX,
    ROUTE_CONSTANTS_DIR_NAME,
    ROUTE_VERSION_FILE_SUFFIX,
    ROUTES_DIR_NAME,
)
from utils.naming import pascal_case, snake_case

from ..route_plan import DartEndpointGroupPlan, DartEndpointOperationPlan, DartRouteVersionPlan


def build_route_plans(spec: dict, class_plans: dict[str, Any], version_folder: str = "latest") -> list[DartRouteVersionPlan]:
    """Build route version and endpoint group plans from OpenAPI spec."""
    paths = spec.get(OPENAPI_PATHS, {})
    version_name = version_folder
    version_class_name = pascal_case(version_name)
    version_file = f"{version_name}{ROUTE_VERSION_FILE_SUFFIX}"

    # Group operations by tag
    tag_groups: dict[str, list[dict]] = {}
    for path, path_item in paths.items():
        for method, operation in path_item.items():
            if method.lower() not in SUPPORTED_OPERATION_METHODS:
                continue

            tags = operation.get("tags", [])
            tag = tags[0] if tags else "default"
            if tag not in tag_groups:
                tag_groups[tag] = []
            tag_groups[tag].append(
                {
                    "operation": operation,
                    "method": method,
                    "path": path,
                }
            )

    # Build endpoint groups
    endpoint_groups: list[DartEndpointGroupPlan] = []
    for tag, operations_list in sorted(tag_groups.items()):
        group_snake = snake_case(tag)
        group_class_name = f"{pascal_case(tag)}{ENDPOINTS_CLASS_SUFFIX}"
        group_property_name = group_snake
        group_folder = Path(ROUTES_DIR_NAME) / ROUTE_CONSTANTS_DIR_NAME
        group_file = f"{group_snake}{ENDPOINTS_FILE_SUFFIX}"

        # Build endpoint operations
        endpoint_operations: list[DartEndpointOperationPlan] = []
        for op_data in operations_list:
            operation = op_data["operation"]
            method = op_data["method"]
            path = op_data["path"]
            operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")
            method_name = operation_id
            summary = operation.get("summary")

            # Extract path parameters
            path_params: list[str] = []
            param_pattern = r"\{([^}]+)\}"
            matches = re.findall(param_pattern, path)
            path_params.extend(matches)

            # Also check parameters section
            parameters = operation.get(OPENAPI_PARAMETERS, [])
            for param in parameters:
                if isinstance(param, dict):
                    if param.get("in") == "path":
                        param_name = param.get("name")
                        if param_name and param_name not in path_params:
                            path_params.append(param_name)
                    elif OPENAPI_REF in param:
                        ref = param[OPENAPI_REF]
                        if ref.startswith(REF_PREFIX_COMPONENTS_PARAMETERS):
                            # Could dereference, but for now skip
                            pass

            is_getter = len(path_params) == 0

            # Build params signature
            params_signature = ", ".join([f"String {p}" for p in path_params])

            # Build endpoint expression using string concatenation
            if is_getter:
                endpoint_expression = f"'{path}'"
            else:
                # Split path by parameters and build concatenation
                parts = []
                current_pos = 0
                for param in path_params:
                    # Find the parameter in the path
                    param_marker = f"{{{param}}}"
                    param_pos = path.find(param_marker, current_pos)
                    if param_pos > current_pos:
                        parts.append(f"'{path[current_pos:param_pos]}'")
                    parts.append(param)
                    current_pos = param_pos + len(param_marker)

                # Add remaining part of path
                if current_pos < len(path):
                    parts.append(f"'{path[current_pos:]}'")

                # Join with +
                endpoint_expression = " + ".join(parts)

            endpoint_operations.append(
                DartEndpointOperationPlan(
                    operation_id=operation_id,
                    method_name=method_name,
                    path=path,
                    path_params=path_params,
                    summary=summary,
                    is_getter=is_getter,
                    params_signature=params_signature,
                    endpoint_expression=endpoint_expression,
                )
            )

        endpoint_groups.append(
            DartEndpointGroupPlan(
                group_name=tag,
                class_name=group_class_name,
                property_name=group_property_name,
                folder=group_folder,
                file_name=group_file,
                operations=endpoint_operations,
            )
        )

    # Build imports for version file
    imports = [f"{ROUTE_CONSTANTS_DIR_NAME}/{group.file_name}" for group in endpoint_groups]

    return [
        DartRouteVersionPlan(
            version_name=version_name,
            class_name=version_class_name,
            folder=Path(ROUTES_DIR_NAME),
            file_name=version_file,
            imports=imports,
            endpoint_groups=endpoint_groups,
        )
    ]
