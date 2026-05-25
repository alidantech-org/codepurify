from __future__ import annotations

from constants.files import (
    LABEL_ALIAS_OF,
    LABEL_API_VERSION,
    LABEL_CONTENT_TYPES,
    LABEL_DASH,
    LABEL_DEPENDENCIES,
    LABEL_DESCRIPTION,
    LABEL_IS_ALIAS,
    LABEL_KEY,
    LABEL_KIND,
    LABEL_METHOD,
    LABEL_NO,
    LABEL_OPENAPI,
    LABEL_OPERATION,
    LABEL_OPERATIONS,
    LABEL_PARAMETERS,
    LABEL_PATH,
    LABEL_REF,
    LABEL_REQUEST_BODY,
    LABEL_REQUIRED,
    LABEL_RESOURCE,
    LABEL_RESOURCES,
    LABEL_RESPONSES,
    LABEL_SCHEMA_REFS,
    LABEL_SCHEMAS,
    LABEL_STATUS_ERROR,
    LABEL_STATUS_OTHER,
    LABEL_STATUS_SUCCESS,
    LABEL_TITLE,
    LABEL_YES,
    LABEL_X_CODEGEN,
    SEPARATOR_ARROW,
    SEPARATOR_COLON,
    SEPARATOR_COMMA,
    SEPARATOR_PATH,
)
from inference.models import InferenceGraph, InferredOperation, InferredResource, InferredSchema


def render_summary(graph: InferenceGraph) -> str:
    return "\n".join(
        [
            f"{LABEL_TITLE}{SEPARATOR_COLON}{graph.title}",
            f"{LABEL_OPENAPI}{SEPARATOR_COLON}{graph.openapi_version}",
            f"{LABEL_API_VERSION}{SEPARATOR_COLON}{graph.api_version}",
            f"{LABEL_RESOURCES}{SEPARATOR_COLON}{len(graph.resources)}",
            f"{LABEL_SCHEMAS}{SEPARATOR_COLON}{len(graph.schemas)}",
            f"{LABEL_OPERATIONS}{SEPARATOR_COLON}{len(graph.operations)}",
            f"{LABEL_DEPENDENCIES}{SEPARATOR_COLON}{len(graph.dependencies)}",
        ]
    )


def render_resource(resource: InferredResource, graph: InferenceGraph) -> str:
    schemas = [schema for schema in graph.schemas if schema.resource == resource]
    operations = [operation for operation in graph.operations if operation.resource == resource]

    lines = [
        f"{LABEL_RESOURCE}{SEPARATOR_COLON}{resource.name}",
        f"{LABEL_KEY}{SEPARATOR_COLON}{resource.key}",
        f"{LABEL_PATH}{SEPARATOR_COLON}{SEPARATOR_PATH.join(resource.path) if resource.path else LABEL_DASH}",
        "",
        f"{LABEL_SCHEMAS}{SEPARATOR_COLON}{len(schemas)}",
        f"{LABEL_OPERATIONS}{SEPARATOR_COLON}{len(operations)}",
    ]

    if operations:
        lines.append("")
        lines.append("Operation IDs:")
        lines.extend(f"- {operation.operation_id}" for operation in operations)

    return "\n".join(lines)


def render_schema(schema: InferredSchema) -> str:
    lines = [
        f"Schema{SEPARATOR_COLON}{schema.name}",
        f"{LABEL_REF}{SEPARATOR_COLON}{schema.ref}",
        f"{LABEL_KIND}{SEPARATOR_COLON}{schema.kind.value}",
        f"{LABEL_RESOURCE}{SEPARATOR_COLON}{schema.resource.name if schema.resource else LABEL_DASH}",
        f"Resource Key{SEPARATOR_COLON}{schema.resource.key if schema.resource else LABEL_DASH}",
        f"{LABEL_X_CODEGEN}{SEPARATOR_COLON}{schema.x_codegen}",
        f"{LABEL_IS_ALIAS}{SEPARATOR_COLON}{schema.is_alias}",
        f"{LABEL_ALIAS_OF}{SEPARATOR_COLON}{schema.alias_of or LABEL_DASH}",
        "",
        f"{LABEL_DEPENDENCIES}{SEPARATOR_COLON}{len(schema.dependencies)}",
    ]

    if schema.dependencies:
        lines.extend(f"- {dependency}" for dependency in schema.dependencies)

    return "\n".join(lines)


def render_operation(operation: InferredOperation) -> str:
    lines = [
        f"{LABEL_OPERATION}{SEPARATOR_COLON}{operation.operation_id}",
        f"{LABEL_METHOD}{SEPARATOR_COLON}{operation.method}",
        f"{LABEL_PATH}{SEPARATOR_COLON}{operation.path}",
        f"{LABEL_RESOURCE}{SEPARATOR_COLON}{operation.resource.name if operation.resource else LABEL_DASH}",
        f"Resource Key{SEPARATOR_COLON}{operation.resource.key if operation.resource else LABEL_DASH}",
        "",
        f"{LABEL_PARAMETERS}{SEPARATOR_COLON}{len(operation.parameters)}",
    ]

    for param in operation.parameters:
        lines.append(f"  - {param.name} ({param.location}, required={param.required})")
        if param.ref:
            lines.append(f"    {LABEL_REF}{SEPARATOR_COLON}{param.ref}")
        if param.schema_ref:
            lines.append(f"    Schema{SEPARATOR_COLON}{param.schema_ref}")

    lines.append("")
    lines.append(f"{LABEL_REQUEST_BODY}{SEPARATOR_COLON}{LABEL_YES if operation.request_body else LABEL_NO}")

    if operation.request_body:
        lines.append(f"  {LABEL_REF}{SEPARATOR_COLON}{operation.request_body.ref or LABEL_DASH}")
        lines.append(f"  {LABEL_REQUIRED}{SEPARATOR_COLON}{operation.request_body.required}")
        lines.append(f"  {LABEL_CONTENT_TYPES}{SEPARATOR_COLON}{SEPARATOR_COMMA.join(operation.request_body.content_types) or LABEL_DASH}")
        for media in operation.request_body.media_types:
            lines.append(f"    {media.content_type}{SEPARATOR_ARROW}{media.schema_ref or LABEL_DASH}")

    lines.extend(render_responses(operation.responses))
    lines.extend(render_schema_refs(operation))

    return "\n".join(lines)


def render_responses(responses) -> list[str]:
    lines = ["", f"{LABEL_RESPONSES}{SEPARATOR_COLON}{len(responses)}"]

    for response in responses:
        status_type = LABEL_STATUS_SUCCESS if response.is_success else LABEL_STATUS_ERROR if response.is_error else LABEL_STATUS_OTHER
        lines.append(f"  - {response.status_code} ({status_type})")
        if response.ref:
            lines.append(f"    {LABEL_REF}{SEPARATOR_COLON}{response.ref}")
        if response.description:
            lines.append(f"    {LABEL_DESCRIPTION}{SEPARATOR_COLON}{response.description}")
        lines.append(f"    {LABEL_CONTENT_TYPES}{SEPARATOR_COLON}{SEPARATOR_COMMA.join(response.content_types) or LABEL_DASH}")
        for media in response.media_types:
            lines.append(f"      {media.content_type}{SEPARATOR_ARROW}{media.schema_ref or LABEL_DASH}")

    return lines


def render_schema_refs(operation: InferredOperation) -> list[str]:
    lines = ["", f"{LABEL_SCHEMA_REFS}{SEPARATOR_COLON}"]
    for param in operation.parameters:
        if param.schema_ref:
            lines.append(f"- {param.schema_ref}")
    if operation.request_body:
        for ref in operation.request_body.schema_refs:
            lines.append(f"- {ref}")
    for response in operation.responses:
        for ref in response.schema_refs:
            lines.append(f"- {ref}")
    return lines
