from __future__ import annotations

from constants.files import (
    LABEL_ALIAS_OF,
    LABEL_DASH,
    LABEL_DEPENDENCIES,
    LABEL_IS_ALIAS,
    LABEL_KIND,
    LABEL_REF,
    LABEL_RESOURCE,
    LABEL_X_CODEGEN,
    SEPARATOR_COLON,
)
from inference.models import InferredSchema


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
