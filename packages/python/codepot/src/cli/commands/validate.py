"""Validate command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import ValidateRequest
from cli import options
from cli.constants.defaults import DEFAULT_SPEC_PATH
from cli.constants.exit_codes import EXIT_VALIDATION_ERROR
from cli.errors import CliError
from cli.presentation.console import print_error, print_header
from cli.presentation.json import print_json_result
from cli.presentation.validate import render_validate_result
from cli.state import get_runtime


def validate_command(
    ctx: typer.Context,
    spec_path: Annotated[Path, options.spec_argument()] = DEFAULT_SPEC_PATH,
    strict: Annotated[
        bool,
        typer.Option("--strict", help="Enable strict validation checks."),
    ] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Validate a Codepot spec."""

    try:
        request = ValidateRequest(spec_path=spec_path, strict=strict, verbose=verbose)
        result = get_runtime(ctx).validate(request)
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            print_header("Validate", str(result.spec_path))
            render_validate_result(result, verbose=verbose)
        if not result.ok:
            raise typer.Exit(EXIT_VALIDATION_ERROR)
    except CliError as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(exc.exit_code) from exc
    except typer.Exit:
        raise
    except Exception as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(EXIT_VALIDATION_ERROR) from exc
