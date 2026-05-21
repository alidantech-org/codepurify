"""
Schema usage tracking for import and placement decisions.

This module answers: which models/types are used by which operations?
It tracks schema usage across request bodies, responses, and parameters to
help prevent unused imports and guide DTO file placement.

This module must not:
- create model plans
- render files
- decide schema kinds (use classify.py)
"""

from dataclasses import dataclass
from typing import Any

from constants.dart_syntax import DART_LOCATION_PARAMETER, DART_LOCATION_REQUEST_BODY, DART_LOCATION_RESPONSE
from constants.openapi_keys import (
    CONTENT_TYPE_APPLICATION_JSON,
    HTTP_METHODS,
    OPENAPI_COMPONENTS,
    OPENAPI_CONTENT,
    OPENAPI_OPERATION_ID,
    OPENAPI_PARAMETERS,
    OPENAPI_PATHS,
    OPENAPI_REF,
    OPENAPI_REQUEST_BODY,
    OPENAPI_REQUEST_BODIES,
    OPENAPI_RESPONSES,
    OPENAPI_SCHEMA,
    OPENAPI_TAGS,
    REF_PREFIX_COMPONENTS_PARAMETERS,
    REF_PREFIX_COMPONENTS_REQUEST_BODIES,
    REF_PREFIX_COMPONENTS_RESPONSES,
)
from constants.sdk_tags import X_SDK_GROUP

Schema = dict[str, Any]
OpenApiSpec = dict[str, Any]


def schema_ref_name(value: dict[str, Any] | None) -> str | None:
    if not value:
        return None

    ref = value.get(OPENAPI_REF)

    if not ref:
        return None

    return ref.split("/")[-1]


@dataclass(frozen=True)
class SchemaUsage:
    schema_name: str
    tag: str
    operation_id: str
    location: str  # request_body, response, parameter

    @property
    def key(self) -> str:
        return f"{self.tag}:{self.operation_id}:{self.location}"


def collect_schema_usage(spec: OpenApiSpec) -> dict[str, list[SchemaUsage]]:
    usage_by_schema: dict[str, list[SchemaUsage]] = {}

    for path, path_item in spec.get(OPENAPI_PATHS, {}).items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            tags = operation.get(OPENAPI_TAGS) or ["Default"]
            # Priority: x-sdk-group > tags
            tag = operation.get(X_SDK_GROUP) or tags[0]
            operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")

            # Check request body (follow component ref)
            request_body = operation.get(OPENAPI_REQUEST_BODY)
            if request_body:
                schema_ref = extract_schema_from_request_body(request_body, spec)
                if schema_ref:
                    usage_by_schema.setdefault(schema_ref, []).append(
                        SchemaUsage(
                            schema_name=schema_ref,
                            tag=tag,
                            operation_id=operation_id,
                            location=DART_LOCATION_REQUEST_BODY,
                        )
                    )

            # Check responses (follow component refs)
            responses = operation.get(OPENAPI_RESPONSES, {})
            for response in responses.values():
                if not isinstance(response, dict):
                    continue

                schema_ref = extract_schema_from_response(response, spec)
                if schema_ref:
                    usage_by_schema.setdefault(schema_ref, []).append(
                        SchemaUsage(
                            schema_name=schema_ref,
                            tag=tag,
                            operation_id=operation_id,
                            location=DART_LOCATION_RESPONSE,
                        )
                    )

            # Check parameters (follow component refs)
            parameters = path_item.get(OPENAPI_PARAMETERS, []) + operation.get(OPENAPI_PARAMETERS, [])
            for param in parameters:
                if not isinstance(param, dict):
                    continue

                schema_ref = extract_schema_from_parameter(param, spec)
                if schema_ref:
                    usage_by_schema.setdefault(schema_ref, []).append(
                        SchemaUsage(
                            schema_name=schema_ref,
                            tag=tag,
                            operation_id=operation_id,
                            location=DART_LOCATION_PARAMETER,
                        )
                    )

    return usage_by_schema


def extract_schema_from_request_body(request_body: dict[str, Any], spec: OpenApiSpec) -> str | None:
    """Extract schema ref from request body, following component references."""
    # Check if it's a component ref
    ref = request_body.get(OPENAPI_REF)
    if ref:
        return extract_schema_from_component_ref(ref, spec)

    # Check direct content
    content = request_body.get(OPENAPI_CONTENT, {})
    app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {})
    schema = app_json.get(OPENAPI_SCHEMA, {})

    return schema_ref_name(schema)


def extract_schema_from_response(response: dict[str, Any], spec: OpenApiSpec) -> str | None:
    """Extract schema ref from response, following component references."""
    # Check if it's a component ref
    ref = response.get(OPENAPI_REF)
    if ref:
        return extract_schema_from_component_ref(ref, spec)

    # Check direct content
    content = response.get(OPENAPI_CONTENT, {})
    app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {})
    schema = app_json.get(OPENAPI_SCHEMA, {})

    return schema_ref_name(schema)


def extract_schema_from_parameter(parameter: dict[str, Any], spec: OpenApiSpec) -> str | None:
    """Extract schema ref from parameter, following component references."""
    # Check if it's a component ref
    ref = parameter.get(OPENAPI_REF)
    if ref:
        return extract_schema_from_component_ref(ref, spec)

    # Check direct schema
    schema = parameter.get(OPENAPI_SCHEMA, {})
    return schema_ref_name(schema)


def extract_schema_from_component_ref(ref: str, spec: OpenApiSpec) -> str | None:
    """Extract schema name from a component reference."""
    if ref.startswith(REF_PREFIX_COMPONENTS_RESPONSES):
        response_name = ref.split("/")[-1]
        response_def = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_RESPONSES, {}).get(response_name)
        if response_def:
            content = response_def.get(OPENAPI_CONTENT, {})
            app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {})
            schema = app_json.get(OPENAPI_SCHEMA, {})
            return schema_ref_name(schema)

    elif ref.startswith(REF_PREFIX_COMPONENTS_REQUEST_BODIES):
        request_body_name = ref.split("/")[-1]
        request_body_def = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_REQUEST_BODIES, {}).get(request_body_name)
        if request_body_def:
            content = request_body_def.get(OPENAPI_CONTENT, {})
            app_json = content.get(CONTENT_TYPE_APPLICATION_JSON, {})
            schema = app_json.get(OPENAPI_SCHEMA, {})
            return schema_ref_name(schema)

    elif ref.startswith(REF_PREFIX_COMPONENTS_PARAMETERS):
        # Parameters don't usually have schemas we care about for DTO placement
        return None

    return None
