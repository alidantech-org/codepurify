from __future__ import annotations

from constants.files import (
    LABEL_CONTENT_TYPES,
    LABEL_DASH,
    LABEL_DESCRIPTION,
    LABEL_NO,
    LABEL_OPERATION,
    LABEL_PARAMETERS,
    LABEL_PATH,
    LABEL_REF,
    LABEL_REQUEST_BODY,
    LABEL_REQUIRED,
    LABEL_RESOURCE,
    LABEL_RESPONSES,
    LABEL_SCHEMA_REFS,
    LABEL_STATUS_ERROR,
    LABEL_STATUS_OTHER,
    LABEL_STATUS_SUCCESS,
    LABEL_YES,
    SEPARATOR_ARROW,
    SEPARATOR_COLON,
    SEPARATOR_COMMA,
)
from inference.models import InferredOperation


def render_operation(operation: InferredOperation) -> str:
    lines = [
        f"{LABEL_OPERATION}{SEPARATOR_COLON}{operation.operation_id}",
        f"Method{SEPARATOR_COLON}{operation.method}",
        f"{LABEL_PATH}{SEPARATOR_COLON}{operation.path}",
        f"{LABEL_RESOURCE}{SEPARATOR_COLON}{operation.resource.name if operation.resource else LABEL_DASH}",
        f"Resource Key{SEPARATOR_COLON}{operation.resource.name if operation.resource else LABEL_DASH}",
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

    # Add generic operation target section
    if operation.target:
        lines.append("")
        lines.append(f"Codegen Operation Target{SEPARATOR_COLON}")
        lines.append(f"  {LABEL_REF}{SEPARATOR_COLON}{operation.target.ref}")
        lines.append(f"  Source{SEPARATOR_COLON}{operation.target.source}")
        if operation.target.inferred_roles:
            lines.append(f"  Inferred Roles{SEPARATOR_COLON}{SEPARATOR_COMMA.join(operation.target.inferred_roles)}")
        if operation.target.locations:
            lines.append(f"  Locations{SEPARATOR_COLON}{SEPARATOR_COMMA.join(operation.target.locations)}")
        if operation.target.reason:
            lines.append(f"  Matched By{SEPARATOR_COLON}{operation.target.reason}")

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
