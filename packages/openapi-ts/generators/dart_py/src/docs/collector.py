from typing import Any

from constants.app import (
    DEFAULT_TAG,
    DOC_KEY_DESCRIPTION,
    DOC_KEY_METHOD,
    DOC_KEY_OPERATION_ID,
    DOC_KEY_PARAMETERS,
    DOC_KEY_PATH,
    DOC_KEY_REQUEST_BODY,
    DOC_KEY_RESPONSES,
    DOC_KEY_SECURITY,
    DOC_KEY_SUMMARY,
    DOC_KEY_TAGS,
    IMPORTANT_SCHEMA_SUFFIXES,
    PRIMITIVE_FIELD_SUFFIXES,
)
from constants.openapi_keys import (
    HTTP_METHODS,
    OPENAPI_COMPONENTS,
    OPENAPI_DESCRIPTION,
    OPENAPI_ENUM,
    OPENAPI_OPERATION_ID,
    OPENAPI_PARAMETERS,
    OPENAPI_PATHS,
    OPENAPI_PROPERTIES,
    OPENAPI_REF,
    OPENAPI_REQUEST_BODY,
    OPENAPI_RESPONSES,
    OPENAPI_SCHEMAS,
    OPENAPI_SECURITY,
    OPENAPI_SUMMARY,
    OPENAPI_TAGS,
    OPENAPI_TYPE,
    OPENAPI_TYPE_OBJECT,
)

OpenApiSpec = dict[str, Any]


def is_important_schema(name: str, schema: dict[str, Any]) -> bool:
    if schema.get(OPENAPI_ENUM):
        return True

    if schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_OBJECT and schema.get(OPENAPI_PROPERTIES):
        return True

    if name.endswith(IMPORTANT_SCHEMA_SUFFIXES):
        return True

    if name.endswith(PRIMITIVE_FIELD_SUFFIXES):
        return False

    return False


def schema_ref_name(value: dict[str, Any] | None) -> str | None:
    if not value:
        return None

    ref = value.get(OPENAPI_REF)

    if not ref:
        return None

    return ref.split("/")[-1]


def collect_operations_by_tag(spec: OpenApiSpec) -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = {}

    for path, path_item in spec.get(OPENAPI_PATHS, {}).items():
        if not isinstance(path_item, dict):
            continue

        path_level_params = path_item.get(OPENAPI_PARAMETERS, [])

        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            tags = operation.get(OPENAPI_TAGS) or [DEFAULT_TAG]
            tag = tags[0]

            parameters = [
                *path_level_params,
                *operation.get(OPENAPI_PARAMETERS, []),
            ]

            doc_operation = {
                DOC_KEY_METHOD: method.upper(),
                DOC_KEY_PATH: path,
                DOC_KEY_OPERATION_ID: operation.get(OPENAPI_OPERATION_ID),
                DOC_KEY_SUMMARY: operation.get(OPENAPI_SUMMARY),
                DOC_KEY_DESCRIPTION: operation.get(OPENAPI_DESCRIPTION),
                DOC_KEY_TAGS: tags,
                DOC_KEY_PARAMETERS: parameters,
                DOC_KEY_REQUEST_BODY: operation.get(OPENAPI_REQUEST_BODY),
                DOC_KEY_RESPONSES: operation.get(OPENAPI_RESPONSES, {}),
                DOC_KEY_SECURITY: operation.get(OPENAPI_SECURITY),
            }

            result.setdefault(tag, []).append(doc_operation)

    return dict(sorted(result.items()))


def collect_important_schemas(spec: OpenApiSpec) -> dict[str, dict[str, Any]]:
    schemas = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_SCHEMAS, {})

    return {name: schema for name, schema in sorted(schemas.items()) if isinstance(schema, dict) and is_important_schema(name, schema)}
