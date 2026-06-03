"""Inspect command."""

from __future__ import annotations

import typer

from app import codepotx
from cli.options import InspectModeOption, SpecPathArg
from cli.presentation.console import print_error
from cli.presentation.inspect import print_inspect_result


def inspect_command(
    spec_path: SpecPathArg,
    mode: InspectModeOption = "overview",
) -> None:
    """Inspect a compiled Codepot spec."""

    try:
        context = codepotx.inspect(spec_path)
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_inspect_result(context, mode)
