"""Composition table printer for allOf inheritance inspection."""

from rich.console import Console
from rich.table import Table

from ...planning.class_plan import DartClassPlan


def print_composition_table(class_plans: dict[str, DartClassPlan], console: Console) -> None:
    """Print composition plans table showing base class and field separation."""
    table = Table(title="Composition Plans")
    table.add_column("Schema", style="cyan")
    table.add_column("Class", style="green")
    table.add_column("Base Class", style="magenta")
    table.add_column("Base Fields", justify="right")
    table.add_column("Own Fields", justify="right")
    table.add_column("Combined", justify="right")

    # Filter to only show classes with inheritance
    inheritance_plans = [
        (name, plan)
        for name, plan in class_plans.items()
        if plan.base_class_name is not None
    ]

    if not inheritance_plans:
        console.print("[dim]No inheritance composition found[/dim]")
        return

    for schema_name, plan in inheritance_plans:
        table.add_row(
            schema_name,
            plan.class_name,
            plan.base_class_name or "-",
            str(len(plan.base_fields)),
            str(len(plan.own_fields)),
            str(len(plan.fields)),
        )

    console.print(table)
