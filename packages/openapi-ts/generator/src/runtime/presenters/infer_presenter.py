from __future__ import annotations

from collections import Counter

from core.logging import key_value_table, warning
from inference.models import InferenceGraph


def present_inference(graph: InferenceGraph) -> None:
    kind_counts = Counter(schema.kind.value for schema in graph.schemas)
    alias_schemas = [schema for schema in graph.schemas if schema.is_alias]

    rows = [
        ("Title", graph.title),
        ("OpenAPI", graph.openapi_version),
        ("API Version", graph.api_version),
        ("Resources", len(graph.resources)),
        ("Schemas", len(graph.schemas)),
        ("Operations", len(graph.operations)),
        ("Dependencies", len(graph.dependencies)),
        ("Alias Schemas", len(alias_schemas)),
    ]

    for kind, count in sorted(kind_counts.items()):
        rows.append((f"Schema Kind: {kind}", count))

    key_value_table("Inference Summary", rows)

    unknown_schemas = [schema for schema in graph.schemas if schema.kind.value == "unknown"]

    if unknown_schemas:
        from rich.table import Table
        from core.logging import console

        warning("Unknown schemas detected. These need classifier improvement.")

        table = Table(title="Unknown Schemas", show_header=True, header_style="bold yellow")
        table.add_column("Name")
        table.add_column("Ref")
        table.add_column("x-codegen.kind")
        table.add_column("Keys")

        for schema in unknown_schemas:
            table.add_row(
                schema.name,
                schema.ref,
                str(schema.x_codegen.get("kind", "-")),
                ", ".join(sorted(schema.raw.keys())),
            )

        console.print(table)

    if alias_schemas:
        from rich.table import Table
        from core.logging import console

        table = Table(title="Alias Schemas", show_header=True, header_style="bold cyan")
        table.add_column("Name")
        table.add_column("Kind")
        table.add_column("Alias Of")
        table.add_column("Resource")

        for schema in alias_schemas:
            table.add_row(
                schema.name,
                schema.kind.value,
                schema.alias_of or "-",
                schema.resource.name if schema.resource else "-",
            )

        console.print(table)
