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
from inference.models import InferredSchema, InferredSchemaKind


def render_schema(schema: InferredSchema) -> str:
    lines = [
        f"Schema{SEPARATOR_COLON}{schema.name}",
        f"{LABEL_REF}{SEPARATOR_COLON}{schema.ref}",
        f"{LABEL_KIND}{SEPARATOR_COLON}{schema.kind.value}",
        f"{LABEL_RESOURCE}{SEPARATOR_COLON}{schema.resource.name if schema.resource else LABEL_DASH}",
        f"Resource Key{SEPARATOR_COLON}{schema.resource.name if schema.resource else LABEL_DASH}",
        f"{LABEL_X_CODEGEN}{SEPARATOR_COLON}{schema.x_codegen}",
        f"{LABEL_IS_ALIAS}{SEPARATOR_COLON}{schema.is_alias}",
        f"{LABEL_ALIAS_OF}{SEPARATOR_COLON}{schema.alias_of or LABEL_DASH}",
    ]

    # Kind-specific sections
    if schema.kind == InferredSchemaKind.PRIMITIVE:
        lines.extend(_render_primitive_section(schema))
    elif schema.kind == InferredSchemaKind.ENUM:
        lines.extend(_render_enum_section(schema))
    elif schema.kind in (InferredSchemaKind.MODEL, InferredSchemaKind.DTO):
        lines.extend(_render_model_section(schema))

    lines.append("")
    lines.append(f"{LABEL_DEPENDENCIES}{SEPARATOR_COLON}{len(schema.dependencies)}")

    if schema.dependencies:
        lines.extend(f"- {dependency}" for dependency in schema.dependencies)

    return "\n".join(lines)


def _render_primitive_section(schema: InferredSchema) -> list[str]:
    """Render primitive-specific sections."""
    lines = ["", "Primitive"]

    if schema.primitive_type:
        lines.append(f"  Type{SEPARATOR_COLON}{schema.primitive_type}")
    if schema.primitive_format:
        lines.append(f"  Format{SEPARATOR_COLON}{schema.primitive_format}")

    if schema.primitive_query:
        lines.append(f"  Query{SEPARATOR_COLON}")
        for key, value in schema.primitive_query.items():
            lines.append(f"    {key}{SEPARATOR_COLON}{value}")

    return lines


def _render_enum_section(schema: InferredSchema) -> list[str]:
    """Render enum-specific sections."""
    lines = ["", "Enum"]

    if schema.enum_type:
        lines.append(f"  Type{SEPARATOR_COLON}{schema.enum_type}")

    if schema.enum_values:
        lines.append(f"  Values{SEPARATOR_COLON}{len(schema.enum_values)}")
        for value in schema.enum_values:
            lines.append(f"    - {value}")

    return lines


def _render_model_section(schema: InferredSchema) -> list[str]:
    """Render model/dto-specific sections."""
    lines = ["", f"Fields{SEPARATOR_COLON}{len(schema.fields)}"]

    for field in schema.fields:
        lines.append(f"  - {field.name}")
        lines.append(f"    Required{SEPARATOR_COLON}{field.required}")
        lines.append(f"    Nullable{SEPARATOR_COLON}{field.nullable}")
        if field.raw_type:
            lines.append(f"    Type{SEPARATOR_COLON}{field.raw_type}")
        if field.format:
            lines.append(f"    Format{SEPARATOR_COLON}{field.format}")
        if field.schema_ref:
            lines.append(f"    Schema Ref{SEPARATOR_COLON}{field.schema_ref}")
        if field.resolved_kind:
            lines.append(f"    Resolved Kind{SEPARATOR_COLON}{field.resolved_kind}")
        if field.resolved_type:
            lines.append(f"    Resolved Type{SEPARATOR_COLON}{field.resolved_type}")
        if field.resolved_format:
            lines.append(f"    Resolved Format{SEPARATOR_COLON}{field.resolved_format}")
        if field.item_ref:
            lines.append(f"    Item Ref{SEPARATOR_COLON}{field.item_ref}")
        if field.resolved_item_kind:
            lines.append(f"    Item Kind{SEPARATOR_COLON}{field.resolved_item_kind}")
        if field.resolved_item_type:
            lines.append(f"    Item Type{SEPARATOR_COLON}{field.resolved_item_type}")
        if field.resolved_item_format:
            lines.append(f"    Item Format{SEPARATOR_COLON}{field.resolved_item_format}")
        if field.enum_values:
            lines.append(f"    Enum{SEPARATOR_COLON}{', '.join(field.enum_values)}")
        if field.default is not None:
            lines.append(f"    Default{SEPARATOR_COLON}{field.default}")
        if field.description:
            lines.append(f"    Description{SEPARATOR_COLON}{field.description}")

    # Add composition information
    if schema.composition:
        lines.append("")
        lines.append(f"Composition{SEPARATOR_COLON}")
        lines.append(f"  Kind{SEPARATOR_COLON}{schema.composition.kind}")

        if schema.inherited_refs:
            lines.append(f"  Inherited Refs{SEPARATOR_COLON}")
            for ref in schema.inherited_refs:
                lines.append(f"    - {ref}")

        if schema.composition_refs:
            lines.append(f"  Composition Refs{SEPARATOR_COLON}")
            for ref in schema.composition_refs:
                lines.append(f"    - {ref}")

        if schema.composition.inline_field_count > 0:
            lines.append(f"  Inline Objects{SEPARATOR_COLON}{schema.composition.inline_field_count}")

    return lines
