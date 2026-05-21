"""
Summary table printer.
"""

from rich.table import Table

from logger import console
from ..models import DartInspection


def print_summary_table(inspection: DartInspection) -> None:
    """Print OpenAPI summary table."""
    summary = Table(title="OpenAPI Summary")
    summary.add_column("#", style="dim")
    summary.add_column("Item", style="cyan")
    summary.add_column("Value", style="green")

    rows = [
        ("Input", inspection.input_path),
        ("Dart Output", inspection.dart_output),
        ("Docs Output", inspection.docs_output),
        ("Package", inspection.package_name),
        ("OpenAPI", str(inspection.openapi_version)),
        ("Paths", str(inspection.paths_count)),
        ("Schemas", str(inspection.schemas_count)),
        ("Operations", str(len(inspection.operations))),
        ("Tags", str(len(inspection.tags))),
    ]

    for index, (label, value) in enumerate(rows, 1):
        summary.add_row(str(index), label, value)

    console.print(summary)
