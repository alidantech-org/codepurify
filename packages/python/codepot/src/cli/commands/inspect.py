"""Inspect command."""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.presentation.console import print_error
from cli.presentation.inspect import print_inspect_result


def inspect_command(
    spec_path: Path = typer.Argument(..., help="Path to compiled Codepot spec."),
    mode: str = typer.Option("overview", "--mode", "-m"),
) -> None:
    """Inspect a compiled Codepot spec."""

    try:
        context = codepotx.inspect(spec_path)
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_inspect_result(context, mode)
