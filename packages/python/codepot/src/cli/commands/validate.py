"""Validate command."""

from __future__ import annotations

import typer

from app import codepotx
from cli.options import SpecPathArg
from cli.presentation.console import print_error
from cli.presentation.validate import print_validate_result


def validate_command(spec_path: SpecPathArg) -> None:
    """Validate a compiled Codepot spec."""

    try:
        context = codepotx.validate(spec_path)
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_validate_result(context)
