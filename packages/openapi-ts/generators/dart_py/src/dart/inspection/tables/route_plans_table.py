"""
Route plans table printer.
"""

from rich.table import Table

from logger import console
from ..models import DartInspection


def print_route_plans_table(inspection: DartInspection) -> None:
    """Print route version/group/endpoint tables."""
    plans = inspection.plans

    if not plans.route_versions:
        return

    for version in plans.route_versions:
        console.print(f"\n[bold cyan]Route Version: {version.version_name}[/bold cyan]")

        version_table = Table()
        version_table.add_column("Group", style="magenta")
        version_table.add_column("Class", style="yellow")
        version_table.add_column("Folder", style="dim")
        version_table.add_column("File", style="cyan")
        version_table.add_column("Operations", style="blue")

        for group in version.endpoint_groups:
            version_table.add_row(
                group.group_name,
                group.class_name,
                str(group.folder),
                group.file_name,
                str(len(group.operations)),
            )

        console.print(version_table)

        endpoint_table = Table(title="Endpoint Operations")
        endpoint_table.add_column("#", style="dim")
        endpoint_table.add_column("Group", style="magenta")
        endpoint_table.add_column("Operation", style="yellow")
        endpoint_table.add_column("Path", style="cyan")
        endpoint_table.add_column("Path Params", style="blue")
        endpoint_table.add_column("Type", style="green")

        row_num = 1
        for group in version.endpoint_groups:
            for operation in group.operations:
                endpoint_table.add_row(
                    str(row_num),
                    group.group_name,
                    operation.method_name,
                    operation.path,
                    ", ".join(operation.path_params) if operation.path_params else "-",
                    "getter" if operation.is_getter else "method",
                )
                row_num += 1

        console.print(endpoint_table)
