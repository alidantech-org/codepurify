"""Inspect command."""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.presentation.console import print_error
from cli.presentation.inspect import print_inspect_result
 
app = typer.Typer(help="Inspect Codepot specs.")

SPEC_PATH_ARGUMENT = typer.Argument(..., help="Path to compiled Codepot spec.")
MODE_OPTION = typer.Option("overview", "--mode", "-m", help="Inspection mode.")


@app.callback(invoke_without_command=True)
def inspect(
    spec_path: Path = SPEC_PATH_ARGUMENT,
    mode: str = MODE_OPTION,
) -> None:
    """Inspect a compiled Codepot spec."""

    try:
        context = codepotx.inspect(spec_path)
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_inspect_result(context, mode)
