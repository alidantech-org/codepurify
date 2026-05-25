from __future__ import annotations

from constants.files import (
    LABEL_DASH,
    LABEL_KEY,
    LABEL_OPERATIONS,
    LABEL_PATH,
    LABEL_RESOURCE,
    LABEL_SCHEMAS,
    SEPARATOR_PATH,
)
from inference.models import InferenceGraph, InferredResource


def render_resource(resource: InferredResource, graph: InferenceGraph) -> str:
    schemas = [schema for schema in graph.schemas if schema.resource == resource]
    operations = [operation for operation in graph.operations if operation.resource == resource]

    lines = [
        f"{LABEL_RESOURCE}{SEPARATOR_PATH}{resource.name}",
        f"{LABEL_KEY}{SEPARATOR_PATH}{resource.name}",
        f"{LABEL_PATH}{SEPARATOR_PATH}{SEPARATOR_PATH.join(resource.path) if resource.path else LABEL_DASH}",
        "",
        f"{LABEL_SCHEMAS}{SEPARATOR_PATH}{len(schemas)}",
        f"{LABEL_OPERATIONS}{SEPARATOR_PATH}{len(operations)}",
    ]

    if operations:
        lines.append("")
        lines.append("Operation IDs:")
        lines.extend(f"- {operation.operation_id}" for operation in operations)

    return "\n".join(lines)
