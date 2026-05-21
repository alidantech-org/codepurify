"""
Enum plans table printer.
"""

from rich.table import Table

from logger import console
from ..models import DartInspection


def print_enum_plans_table(inspection: DartInspection) -> None:
    """Print enum plans table."""
    plans = inspection.plans

    if not plans.enums:
        return

    enum_table = Table(title="Dart Enum Plans")
    enum_table.add_column("#", style="dim")
    enum_table.add_column("Schema", style="cyan")
    enum_table.add_column("Enum", style="yellow")
    enum_table.add_column("Values", style="green")
    enum_table.add_column("Folder", style="dim")
    enum_table.add_column("File", style="cyan")

    for index, plan in enumerate(plans.enums.values(), 1):
        enum_table.add_row(
            str(index),
            plan.schema_name,
            plan.enum_name,
            str(len(plan.values)),
            str(plan.output_path.parent),
            plan.output_path.name,
        )

    console.print(enum_table)
