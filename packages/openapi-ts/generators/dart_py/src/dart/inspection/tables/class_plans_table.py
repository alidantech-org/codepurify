"""
Class plans table printer.
"""

from rich.table import Table

from logger import console
from ..models import DartInspection


def print_class_plans_table(inspection: DartInspection) -> None:
    """Print Dart class plans table."""
    plans = inspection.plans

    if not plans.classes:
        return

    class_table = Table(title="Dart Class Plans")
    class_table.add_column("#", style="dim")
    class_table.add_column("Schema/Source", style="cyan")
    class_table.add_column("Class", style="yellow")
    class_table.add_column("Kind", style="green")
    class_table.add_column("Usage", style="magenta")
    class_table.add_column("Operation", style="blue")
    class_table.add_column("Status", style="dim")
    class_table.add_column("Folder", style="dim")
    class_table.add_column("File", style="cyan")
    class_table.add_column("Fields", style="dim")
    class_table.add_column("Fields Class", style="yellow")
    class_table.add_column("Imports", style="dim")

    for index, plan in enumerate(plans.classes.values(), 1):
        class_table.add_row(
            str(index),
            plan.schema_name or plan.source_schema or "-",
            plan.class_name,
            plan.kind.value,
            plan.usage_type,
            plan.operation_id or "-",
            plan.status_code or "-",
            str(plan.model_path.parent),
            plan.model_path.name,
            str(len(plan.fields)),
            plan.fields_class_name,
            str(len(plan.imports)),
        )

    console.print(class_table)
