"""Validate command."""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.presentation.console import print_error
from cli.presentation.validate import print_validate_result

app = typer.Typer(help="Validate Codepot specs.")

SPEC_PATH_ARGUMENT = typer.Argument(..., help="Path to compiled Codepot spec.")

 
@app.callback(invoke_without_command=True)
def validate(
    spec_path: Path = SPEC_PATH_ARGUMENT,
) -> None:
    """Validate a compiled Codepot spec."""

    try:
        context = codepotx.validate(spec_path)
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_validate_result(context)
