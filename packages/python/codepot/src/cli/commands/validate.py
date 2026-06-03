"""Validate command."""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.presentation.console import print_error
from cli.presentation.validate import print_validate_result


def validate_command(
    spec_path: Path = typer.Argument(..., help="Path to compiled Codepot spec."),
) -> None:
    """Validate a compiled Codepot spec."""

    try:
        context = codepotx.validate(spec_path)
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_validate_result(context)
