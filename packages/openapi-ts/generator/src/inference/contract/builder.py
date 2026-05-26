"""Build stable API contracts from inference graphs."""

from __future__ import annotations

from typing import Any

from contracts.api import (
    ApiContract,
    ApiDocumentInfo,
    ApiField,
    ApiOperation,
    ApiParameter,
    ApiRequestBody,
    ApiResource,
    ApiResponse,
    ApiSchema,
)
from contracts.names import make_contract_name
from inference.contract.classifier import classify_schemas
from inference.contract.query_options import build_query_options


def build_api_contract(graph: Any) -> ApiContract:
    """Convert an inference graph into a stable API contract."""
    schemas = tuple(_schema(item) for item in _items(graph, "schemas"))
    schema_groups = classify_schemas(schemas)

    return ApiContract(
        info=ApiDocumentInfo(
            title=str(getattr(graph, "title", "-")),
            openapi_version=str(getattr(graph, "openapi_version", "-")),
            api_version=str(getattr(graph, "api_version", "-")),
            description=str(getattr(graph, "description", "-")),
        ),
        resources=tuple(_resource(item) for item in _items(graph, "resources")),
        schemas=schema_groups,
        operations=tuple(_operation(item) for item in _items(graph, "operations")),
    )


def _resource(resource: Any) -> ApiResource:
    name = _name(resource, "name", "resource_name", default="resource")
    path = _path_value(_value(resource, "path", default="-"))

    return ApiResource(
        id=name,
        name=make_contract_name(name),
        path=path,
        operations_count=_int_value(resource, "operation_count", "operations_count"),
        meta={
            "raw": resource,
        },
    )


def _schema(schema: Any) -> ApiSchema:
    name = _name(schema, "name", "schema_name", "component_name", default="schema")
    kind = _kind_value(schema)
    x_codegen = _value(schema, "x_codegen", default={})
    query = build_query_options(x_codegen)

    return ApiSchema(
        id=name,
        name=make_contract_name(name),
        kind=kind,
        ref=str(_value(schema, "ref", "schema_ref", default="-")),
        resource=_resource_name(_value(schema, "resource", default=None)),
        fields=tuple(_field(item) for item in _items(schema, "fields")),
        enum_values=(),
        is_alias=bool(_value(schema, "is_alias", default=False)),
        alias_of=_nullable_str(_value(schema, "alias_of", default=None)),
        description=str(_value(schema, "description", default="-")),
        query=query,
        meta={
            "raw": schema,
            "x_codegen": x_codegen,
        },
    )


def _field(field: Any) -> ApiField:
    name = _name(field, "name", "field_name", default="field")
    x_codegen = _value(field, "x_codegen", default={})
    query = build_query_options(x_codegen)

    return ApiField(
        id=name,
        name=make_contract_name(name),
        required=bool(_value(field, "required", default=True)),
        nullable=bool(_value(field, "nullable", default=False)),
        api_type=str(_value(field, "api_type", "type", "type_name", default="unknown")),
        ref=_nullable_str(_value(field, "ref", "schema_ref", default=None)),
        enum_ref=_nullable_str(_value(field, "enum_ref", default=None)),
        description=str(_value(field, "description", default="-")),
        query=query,
        meta={
            "raw": field,
            "x_codegen": x_codegen,
        },
    )


def _operation(operation: Any) -> ApiOperation:
    operation_id = _name(operation, "operation_id", "id", "name", default="operation")

    return ApiOperation(
        id=operation_id,
        name=make_contract_name(operation_id),
        method=str(_value(operation, "method", default="-")),
        path=str(_value(operation, "path", default="-")),
        resource=_resource_name(_value(operation, "resource", default=None)),
        parameters=tuple(_parameter(item) for item in _items(operation, "parameters")),
        request_body=_request_body(_value(operation, "request_body", default=None)),
        responses=tuple(_response(item) for item in _items(operation, "responses")),
        description=str(_value(operation, "description", default="-")),
        meta={
            "raw": operation,
        },
    )


def _parameter(parameter: Any) -> ApiParameter:
    name = _name(parameter, "name", "parameter_name", default="parameter")

    return ApiParameter(
        id=name,
        name=make_contract_name(name),
        location=str(_value(parameter, "location", "in_", "param_in", default="-")),
        required=bool(_value(parameter, "required", default=False)),
        api_type=str(_value(parameter, "api_type", "type", "type_name", default="unknown")),
        ref=_nullable_str(_value(parameter, "ref", "schema_ref", default=None)),
        description=str(_value(parameter, "description", default="-")),
        meta={
            "raw": parameter,
        },
    )


def _request_body(request_body: Any) -> ApiRequestBody | None:
    if request_body is None:
        return None

    return ApiRequestBody(
        required=bool(_value(request_body, "required", default=False)),
        content_types=tuple(str(item) for item in _items(request_body, "content_types")),
        schema_refs=tuple(str(item) for item in _items(request_body, "schema_refs")),
        meta={
            "raw": request_body,
        },
    )


def _response(response: Any) -> ApiResponse:
    return ApiResponse(
        status_code=str(_value(response, "status_code", "status", default="-")),
        description=str(_value(response, "description", default="-")),
        content_types=tuple(str(item) for item in _items(response, "content_types")),
        schema_refs=tuple(str(item) for item in _items(response, "schema_refs")),
        is_success=bool(_value(response, "is_success", default=False)),
        is_error=bool(_value(response, "is_error", default=False)),
        meta={
            "raw": response,
        },
    )


def _items(value: Any, name: str) -> list[Any]:
    result = getattr(value, name, [])

    if result is None:
        return []

    if isinstance(result, dict):
        return list(result.values())

    if isinstance(result, list | tuple | set):
        return list(result)

    return []


def _value(value: Any, *names: str, default: Any = "-") -> Any:
    if value is None:
        return default

    for name in names:
        if hasattr(value, name):
            result = getattr(value, name)
            return default if result is None else result

    return default


def _name(value: Any, *names: str, default: str) -> str:
    result = _value(value, *names, default=default)
    return str(result or default)


def _kind_value(value: Any) -> str:
    kind = _value(value, "kind", "schema_kind", default="unknown")
    return str(getattr(kind, "value", kind))


def _resource_name(value: Any) -> str | None:
    if value is None:
        return None

    for attr in ("name", "resource_name", "id"):
        if hasattr(value, attr):
            result = getattr(value, attr)
            return str(result) if result is not None else None

    return str(value)


def _path_value(value: Any) -> str:
    if isinstance(value, list | tuple):
        return "/".join(str(part) for part in value) or "-"

    return str(value or "-")


def _int_value(value: Any, *names: str) -> int:
    result = _value(value, *names, default=0)

    try:
        return int(result)
    except (TypeError, ValueError):
        return 0


def _nullable_str(value: Any) -> str | None:
    if value is None:
        return None

    text = str(value)
    return text if text else None
