from typing import Any

from constants.openapi_keys import (
    HTTP_METHODS,
    OPENAPI_COMPONENTS,
    OPENAPI_OPERATION_ID,
    OPENAPI_PATHS,
    OPENAPI_SCHEMAS,
    OPENAPI_TAGS,
)

OpenApiSpec = dict[str, Any]


def count_schemas(spec: OpenApiSpec) -> int:
    return len(spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_SCHEMAS, {}))


def count_paths(spec: OpenApiSpec) -> int:
    return len(spec.get(OPENAPI_PATHS, {}))


def collect_operations(spec: OpenApiSpec) -> list[dict[str, Any]]:
    operations: list[dict[str, Any]] = []

    for path, path_item in spec.get(OPENAPI_PATHS, {}).items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            operations.append(
                {
                    "path": path,
                    "method": method.upper(),
                    "operation_id": operation.get(OPENAPI_OPERATION_ID),
                    "tags": operation.get(OPENAPI_TAGS, []),
                }
            )

    return operations


def collect_tags(spec: OpenApiSpec) -> list[str]:
    tags: set[str] = set()

    for operation in collect_operations(spec):
        for tag in operation["tags"]:
            tags.add(tag)

    return sorted(tags)
