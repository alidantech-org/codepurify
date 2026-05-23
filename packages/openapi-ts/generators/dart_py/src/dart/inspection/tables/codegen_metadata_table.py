"""
Codegen metadata table printer.
"""

from rich.table import Table

from logger import console
from openapi.codegen_metadata import read_codegen_metadata


def print_codegen_metadata_table(schemas: dict) -> None:
    """Print x-codegen metadata table for schemas."""
    if not schemas:
        return

    metadata_table = Table(title="x-codegen Metadata")
    metadata_table.add_column("Schema", style="cyan")
    metadata_table.add_column("Kind", style="magenta")
    metadata_table.add_column("Group", style="green")
    metadata_table.add_column("Entity", style="yellow")
    metadata_table.add_column("Component", style="blue")
    metadata_table.add_column("Skip", style="red")

    for schema_name, schema in sorted(schemas.items()):
        if not isinstance(schema, dict):
            continue

        meta = read_codegen_metadata(schema)

        if not meta.is_present:
            continue

        metadata_table.add_row(
            schema_name,
            meta.kind or "-",
            meta.group or "-",
            meta.entity or "-",
            meta.component or "-",
            "true" if meta.skip else "false",
        )

    console.print(metadata_table)


def print_operation_codegen_metadata_table(operations: dict) -> None:
    """Print x-codegen metadata table for operations."""
    if not operations:
        return

    metadata_table = Table(title="Operation x-codegen Metadata")
    metadata_table.add_column("Operation", style="cyan")
    metadata_table.add_column("Resource", style="magenta")
    metadata_table.add_column("QuerySchema", style="green")

    for path, path_item in operations.items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if not isinstance(operation, dict):
                continue

            operation_id = operation.get("operationId", f"{method}_{path}")
            meta = read_codegen_metadata(operation)

            if not meta.is_present:
                continue

            query_schema = "-"
            if meta.raw and isinstance(meta.raw, dict):
                query_schema_obj = meta.raw.get("querySchema", {})
                if isinstance(query_schema_obj, dict):
                    query_ref = query_schema_obj.get("$ref", "")
                    if query_ref:
                        query_schema = query_ref.split("/")[-1] if "/" in query_ref else query_ref

            metadata_table.add_row(
                operation_id,
                meta.resource or "-",
                query_schema,
            )

    console.print(metadata_table)
