"""Infer command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import InferRequest
from cli import options
from cli.constants.defaults import DEFAULT_LANGUAGE, DEFAULT_OUTPUT_PATH, DEFAULT_SPEC_PATH
from cli.constants.exit_codes import EXIT_GENERATION_ERROR
from cli.errors import CliError
from cli.presentation.console import print_error
from cli.presentation.infer import render_infer_result
from cli.presentation.json import print_json_result
from cli.state import get_runtime


def infer_command(
    ctx: typer.Context,
    spec_path: Annotated[Path, options.spec_argument()] = DEFAULT_SPEC_PATH,
    language: Annotated[str, options.language_option()] = DEFAULT_LANGUAGE,
    templates_path: Annotated[Path | None, options.templates_option()] = None,
    output_path: Annotated[Path, options.output_option()] = DEFAULT_OUTPUT_PATH,
    only: Annotated[str | None, options.only_option()] = None,
    show_context: Annotated[
        bool,
        typer.Option("--show-context", help="Show generation context summaries."),
    ] = False,
    show_paths: Annotated[
        bool,
        typer.Option("--show-paths", help="Print planned paths only."),
    ] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Show what would be generated."""

    try:
        request = InferRequest(
            spec_path=spec_path,
            language=language,
            templates_path=templates_path,
            output_path=output_path,
            only=options.parse_only(only),
            show_context=show_context,
            show_paths=show_paths,
            verbose=verbose,
        )
        result = get_runtime(ctx).infer(request)
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            render_infer_result(result)
    except CliError as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(exc.exit_code) from exc
    except Exception as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(EXIT_GENERATION_ERROR) from exc
