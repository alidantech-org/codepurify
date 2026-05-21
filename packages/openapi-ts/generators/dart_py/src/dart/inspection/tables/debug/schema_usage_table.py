"""
Schema usage table printer (debug mode).
"""

from rich.table import Table

from dart.planning.operation_usage import collect_schema_usage
from logger import console
from ...models import DartInspection


def print_schema_usage_table(inspection: DartInspection) -> None:
    """Print Schema Usage table."""
    usage_by_schema = collect_schema_usage(inspection.spec)

    console.print(f"[yellow]Found usage for {len(usage_by_schema)} schemas[/yellow]")

    if usage_by_schema:
        usage_table = Table(title="Schema Usage")
        usage_table.add_column("#", style="dim")
        usage_table.add_column("Schema", style="cyan")
        usage_table.add_column("Tag", style="yellow")
        usage_table.add_column("Operation", style="green")
        usage_table.add_column("Location", style="magenta")

        row_num = 1
        for schema_name, usages in sorted(usage_by_schema.items()):
            for usage in usages:
                usage_table.add_row(
                    str(row_num),
                    schema_name,
                    usage.tag,
                    usage.operation_id,
                    usage.location,
                )
                row_num += 1

        console.print(usage_table)
    else:
        console.print("[red]No schema usage found![/red]")
