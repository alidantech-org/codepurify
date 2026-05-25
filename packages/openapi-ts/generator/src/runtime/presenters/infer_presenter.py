from __future__ import annotations

from collections import Counter

from constants.files import (
    COL_ALIAS_OF,
    COL_KIND,
    COL_KEYS,
    COL_NAME,
    COL_REF,
    COL_RESOURCE,
    COL_X_CODEGEN_KIND,
    LABEL_DASH,
    MSG_UNKNOWN_SCHEMAS_DETECTED,
    ROW_ALIAS_SCHEMAS,
    ROW_API_VERSION,
    ROW_DEPENDENCIES,
    ROW_OPENAPI,
    ROW_OPERATIONS,
    ROW_RESOURCES,
    ROW_SCHEMA_KIND_PREFIX,
    ROW_SCHEMAS,
    ROW_TITLE,
    SEPARATOR_COMMA,
    TITLE_ALIAS_SCHEMAS,
    TITLE_INFERENCE_SUMMARY,
    TITLE_UNKNOWN_SCHEMAS,
)
from core.logging import STYLE_VALUE_BOLD_CYAN, STYLE_VALUE_BOLD_YELLOW, console, key_value_table, warning
from inference.models import InferenceGraph


def present_inference(graph: InferenceGraph) -> None:
    kind_counts = Counter(schema.kind.value for schema in graph.schemas)
    alias_schemas = [schema for schema in graph.schemas if schema.is_alias]

    rows = [
        (ROW_TITLE, graph.title),
        (ROW_OPENAPI, graph.openapi_version),
        (ROW_API_VERSION, graph.api_version),
        (ROW_RESOURCES, len(graph.resources)),
        (ROW_SCHEMAS, len(graph.schemas)),
        (ROW_OPERATIONS, len(graph.operations)),
        (ROW_DEPENDENCIES, len(graph.dependencies)),
        (ROW_ALIAS_SCHEMAS, len(alias_schemas)),
    ]

    for kind, count in sorted(kind_counts.items()):
        rows.append((f"{ROW_SCHEMA_KIND_PREFIX}{kind}", count))

    key_value_table(TITLE_INFERENCE_SUMMARY, rows)

    unknown_schemas = [schema for schema in graph.schemas if schema.kind.value == "unknown"]

    if unknown_schemas:
        from rich.table import Table

        warning(MSG_UNKNOWN_SCHEMAS_DETECTED)

        table = Table(title=TITLE_UNKNOWN_SCHEMAS, show_header=True, header_style=STYLE_VALUE_BOLD_YELLOW)
        table.add_column(COL_NAME)
        table.add_column(COL_REF)
        table.add_column(COL_X_CODEGEN_KIND)
        table.add_column(COL_KEYS)

        for schema in unknown_schemas:
            table.add_row(
                schema.name,
                schema.ref,
                str(schema.x_codegen.get("kind", LABEL_DASH)),
                SEPARATOR_COMMA.join(sorted(schema.raw.keys())),
            )

        console.print(table)

    if alias_schemas:
        from rich.table import Table

        table = Table(title=TITLE_ALIAS_SCHEMAS, show_header=True, header_style=STYLE_VALUE_BOLD_CYAN)
        table.add_column(COL_NAME)
        table.add_column(COL_KIND)
        table.add_column(COL_ALIAS_OF)
        table.add_column(COL_RESOURCE)

        for schema in alias_schemas:
            table.add_row(
                schema.name,
                schema.kind.value,
                schema.alias_of or LABEL_DASH,
                schema.resource.name if schema.resource else LABEL_DASH,
            )

        console.print(table)
