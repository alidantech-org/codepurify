"""Inference-to-API contract mapping.

This module converts existing inference facts into stable API contract models.
It must not infer from raw OpenAPI, classify raw schemas, or parse x-codegen.
"""

from __future__ import annotations

from typing import Any

from contracts.api import (
    ApiComposition,
    ApiContract,
    ApiDependency,
    ApiDocumentInfo,
    ApiEnumValue,
    ApiField,
    ApiFieldKind,
    ApiFieldType,
    ApiHttpMethod,
    ApiMediaType,
    ApiOperation,
    ApiOperationTarget,
    ApiParameter,
    ApiQueryOptions,
    ApiRequestBody,
    ApiResource,
    ApiResponse,
    ApiSchema,
    ApiSchemaGroups,
    ApiSchemaKind,
)
from constants.codegen import (
    KIND_DTO,
    KIND_ENUM,
    KIND_MODEL,
    KIND_PRIMITIVE,
    X_CODEGEN,
)
from constants.http import (
    DELETE,
    GET,
    HEAD,
    OPTIONS,
    PATCH,
    POST,
    PUT,
    TRACE,
)
from constants.openapi import (
    DESCRIPTION,
    RAW,
    SUMMARY,
    TYPE_ARRAY,
    TYPE_OBJECT,
)
from contracts.names import make_contract_name
from inference.models import (
    InferenceGraph,
    InferredDependency,
    InferredMediaType,
    InferredOperation,
    InferredOperationTarget,
    InferredParameter,
    InferredRequestBody,
    InferredResource,
    InferredResponse,
    InferredSchema,
    InferredSchemaKind,
)
from inference.models.schemas import (
    InferredSchemaComposition,
    InferredSchemaField,
    QueryMetadata,
)


def _map_schema_kind(kind: InferredSchemaKind) -> ApiSchemaKind:
    """Map inference schema kind to API schema kind enum."""
    kind_map = {
        InferredSchemaKind.MODEL: ApiSchemaKind.MODEL,
        InferredSchemaKind.DTO: ApiSchemaKind.DTO,
        InferredSchemaKind.ENUM: ApiSchemaKind.ENUM,
        InferredSchemaKind.PRIMITIVE: ApiSchemaKind.PRIMITIVE,
        InferredSchemaKind.UNKNOWN: ApiSchemaKind.UNKNOWN,
    }
    return kind_map.get(kind, ApiSchemaKind.UNKNOWN)


def _map_field_kind(kind: str | None) -> ApiFieldKind:
    """Map inference field kind string to API field kind enum."""
    if not kind:
        return ApiFieldKind.UNKNOWN

    kind_map = {
        KIND_PRIMITIVE: ApiFieldKind.PRIMITIVE,
        KIND_ENUM: ApiFieldKind.ENUM,
        KIND_MODEL: ApiFieldKind.MODEL,
        KIND_DTO: ApiFieldKind.DTO,
        TYPE_ARRAY: ApiFieldKind.ARRAY,
        TYPE_OBJECT: ApiFieldKind.OBJECT,
    }
    return kind_map.get(kind.lower(), ApiFieldKind.UNKNOWN)


def _map_http_method(method: str) -> ApiHttpMethod:
    """Map HTTP method string to API HTTP method enum."""
    method_map = {
        GET: ApiHttpMethod.GET,
        POST: ApiHttpMethod.POST,
        PUT: ApiHttpMethod.PUT,
        PATCH: ApiHttpMethod.PATCH,
        DELETE: ApiHttpMethod.DELETE,
        OPTIONS: ApiHttpMethod.OPTIONS,
        HEAD: ApiHttpMethod.HEAD,
        TRACE: ApiHttpMethod.TRACE,
    }
    return method_map.get(method.lower(), ApiHttpMethod.UNKNOWN)


def build_api_contract(graph: InferenceGraph) -> ApiContract:
    """Build a stable API contract from an inference graph."""
    schemas = tuple(_schema(schema) for schema in graph.schemas)

    return ApiContract(
        info=ApiDocumentInfo(
            title=graph.title,
            openapi_version=graph.openapi_version,
            api_version=graph.api_version,
            description=graph.description,
        ),
        resources=tuple(_resource(resource, graph) for resource in graph.resources),
        schemas=_schema_groups(schemas),
        operations=tuple(_operation(operation) for operation in graph.operations),
        dependencies=tuple(_dependency(dependency) for dependency in graph.dependencies),
    )


def _resource(resource: InferredResource, graph: InferenceGraph) -> ApiResource:
    operations_count = sum(1 for operation in graph.operations if operation.resource == resource)

    return ApiResource(
        id=resource.name,
        name=make_contract_name(resource.name),
        path=resource.path,
        path_name=make_contract_name("_".join(resource.path) if resource.path else resource.name),
        operations_count=operations_count,
    )


def _schema(schema: InferredSchema) -> ApiSchema:
    return ApiSchema(
        id=schema.name,
        name=make_contract_name(schema.name),
        ref=schema.ref,
        kind=_map_schema_kind(schema.kind),
        resource=_resource_name(schema.resource),
        dependencies=_tuple(schema.dependencies),
        is_alias=schema.is_alias,
        alias_of=schema.alias_of,
        primitive_type=schema.primitive_type,
        primitive_format=schema.primitive_format,
        query=_query(schema.query),
        enum_type=schema.enum_type,
        enum_values=tuple(_enum_value(value) for value in _tuple(schema.enum_values)),
        fields=tuple(_field(field) for field in _tuple(schema.fields)),
        composition_refs=_tuple(schema.composition_refs),
        inherited_refs=_tuple(schema.inherited_refs),
        composition=_composition(schema.composition),
        description=str(schema.raw.get(DESCRIPTION) or "-"),
        meta={
            X_CODEGEN: schema.x_codegen,
        },
    )


def _field(field: InferredSchemaField) -> ApiField:
    return ApiField(
        id=field.name,
        name=make_contract_name(field.name),
        required=field.required,
        nullable=field.nullable,
        type=ApiFieldType(
            raw_type=field.raw_type,
            format=field.format,
            kind=_map_field_kind(field.resolved_kind),
            type=field.resolved_type,
            resolved_format=field.resolved_format,
            item_kind=_map_field_kind(field.resolved_item_kind),
            item_type=field.resolved_item_type,
            item_format=field.resolved_item_format,
        ),
        schema_ref=field.schema_ref,
        schema_refs=_tuple(field.schema_refs),
        item_ref=field.item_ref,
        item_refs=_tuple(field.item_refs),
        enum_values=tuple(str(value) for value in _tuple(field.enum_values)),
        default=field.default,
        description=field.description or "-",
        query=_query(field.query),
    )


def _enum_value(value: str) -> ApiEnumValue:
    return ApiEnumValue(
        value=value,
        name=make_contract_name(value),
    )


def _composition(
    composition: InferredSchemaComposition | None,
) -> ApiComposition | None:
    if composition is None:
        return None

    return ApiComposition(
        kind=composition.kind,
        refs=composition.refs,
        inline_field_count=composition.inline_field_count,
    )


def _operation(operation: InferredOperation) -> ApiOperation:
    return ApiOperation(
        id=operation.operation_id,
        name=make_contract_name(operation.operation_id),
        method=_map_http_method(operation.method),
        path=operation.path,
        resource=_resource_name(operation.resource),
        parameters=tuple(_parameter(parameter) for parameter in operation.parameters),
        request_body=_request_body(operation.request_body),
        responses=tuple(_response(response) for response in operation.responses),
        target=_operation_target(operation.target),
        description=str(operation.raw.get(DESCRIPTION) or operation.raw.get(SUMMARY) or "-"),
    )


def _parameter(parameter: InferredParameter) -> ApiParameter:
    return ApiParameter(
        id=parameter.name,
        name=make_contract_name(parameter.name),
        location=parameter.location,
        required=parameter.required,
        ref=parameter.ref,
        schema_ref=parameter.schema_ref,
        schema_refs=parameter.schema_refs,
    )


def _request_body(
    request_body: InferredRequestBody | None,
) -> ApiRequestBody | None:
    if request_body is None:
        return None

    return ApiRequestBody(
        ref=request_body.ref,
        required=request_body.required,
        content_types=tuple(str(value) for value in _tuple(request_body.content_types)),
        media_types=tuple(_media_type(media_type) for media_type in _tuple(request_body.media_types)),
        schema_refs=tuple(str(value) for value in _tuple(request_body.schema_refs)),
    )


def _response(response: InferredResponse) -> ApiResponse:
    return ApiResponse(
        status_code=response.status_code,
        ref=response.ref,
        description=response.description or "-",
        content_types=tuple(str(value) for value in _tuple(response.content_types)),
        media_types=tuple(_media_type(media_type) for media_type in _tuple(response.media_types)),
        schema_refs=tuple(str(value) for value in _tuple(response.schema_refs)),
        is_success=response.is_success,
        is_error=response.is_error,
    )


def _media_type(media_type: InferredMediaType) -> ApiMediaType:
    return ApiMediaType(
        content_type=media_type.content_type,
        schema_ref=media_type.schema_ref,
        schema_refs=tuple(str(value) for value in _tuple(media_type.schema_refs)),
    )


def _operation_target(
    target: InferredOperationTarget | None,
) -> ApiOperationTarget | None:
    if target is None:
        return None

    return ApiOperationTarget(
        ref=target.ref,
        source=target.source,
        exclude=target.exclude,
        inferred_roles=target.inferred_roles,
        locations=target.locations,
        reason=target.reason,
    )


def _dependency(dependency: InferredDependency) -> ApiDependency:
    return ApiDependency(
        source_ref=dependency.source_ref,
        target_ref=dependency.target_ref,
    )


def _query(query: QueryMetadata) -> ApiQueryOptions:
    return ApiQueryOptions(
        filterable=query.filterable,
        operators=query.operators,
        sortable=query.sortable,
        selectable=query.selectable,
        searchable=query.searchable,
        meta={RAW: query},
    )


def _tuple(value: Any) -> tuple[Any, ...]:
    """Return a tuple for optional tuple/list/set inference fields."""
    if value is None:
        return ()

    if isinstance(value, tuple):
        return value

    if isinstance(value, list | set):
        return tuple(value)

    return (value,)


def _operators(value: Any) -> tuple[str, ...]:
    if value is None:
        return ()

    if isinstance(value, str):
        return (value,)

    if isinstance(value, list | tuple | set):
        return tuple(str(item) for item in value)

    return (str(value),)


def _resource_name(resource: InferredResource | None) -> str | None:
    if resource is None:
        return None

    return resource.name


def _schema_groups(schemas: tuple[ApiSchema, ...]) -> ApiSchemaGroups:
    models = _schemas_by_kind(schemas, InferredSchemaKind.MODEL)
    dtos = _schemas_by_kind(schemas, InferredSchemaKind.DTO)
    enums = _schemas_by_kind(schemas, InferredSchemaKind.ENUM)
    primitives = _schemas_by_kind(schemas, InferredSchemaKind.PRIMITIVE)
    unknown = _schemas_by_kind(schemas, InferredSchemaKind.UNKNOWN)
    aliases = tuple(schema for schema in schemas if schema.is_alias)

    return ApiSchemaGroups(
        all=schemas,
        models=models,
        dtos=dtos,
        enums=enums,
        primitives=primitives,
        aliases=aliases,
        unknown=unknown,
        emit_models=models,
        emit_dtos=dtos,
        emit_enums=enums,
    )


def _schemas_by_kind(
    schemas: tuple[ApiSchema, ...],
    kind: InferredSchemaKind,
) -> tuple[ApiSchema, ...]:
    return tuple(schema for schema in schemas if schema.kind == kind.value)
