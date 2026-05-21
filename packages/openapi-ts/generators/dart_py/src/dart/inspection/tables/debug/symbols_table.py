"""
Dart symbols table printer (debug mode).
"""

from rich.table import Table

from dart.registry import build_schema_registry
from logger import console
from ...models import DartInspection


def print_symbols_table(inspection: DartInspection) -> None:
    """Print Dart Symbols table."""
    registry = build_schema_registry(inspection.spec)

    symbol_table = Table(title="Dart Symbols")
    symbol_table.add_column("#", style="dim")
    symbol_table.add_column("Schema", style="cyan")
    symbol_table.add_column("Kind", style="yellow")
    symbol_table.add_column("Dart", style="green")
    symbol_table.add_column("Path", style="magenta")

    for i, symbol in enumerate(registry.values(), 1):
        symbol_table.add_row(
            str(i),
            symbol.schema_name,
            symbol.kind.value,
            symbol.dart_name,
            str(symbol.path or "-"),
        )

    console.print(symbol_table)
