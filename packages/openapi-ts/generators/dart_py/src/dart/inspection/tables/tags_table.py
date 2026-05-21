"""
Tags table printer.
"""

from rich.table import Table

from logger import console
from ..models import DartInspection


def print_tags_table(inspection: DartInspection) -> None:
    """Print API tags table."""
    if not inspection.tags:
        return

    tag_table = Table(title="API Tags")
    tag_table.add_column("#", style="dim")
    tag_table.add_column("Tag", style="magenta")

    for index, tag in enumerate(inspection.tags, 1):
        tag_table.add_row(str(index), tag)

    console.print(tag_table)
