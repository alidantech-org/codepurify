"""Infer command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import InferRequest
from cli import options
from cli.constants.exit_codes import EXIT_GENERATION_ERROR
from cli.errors import CliError
from cli.presentation.console import print_error
from cli.presentation.infer import render_infer_result
from cli.presentation.json import print_json_result
from cli.state import get_runtime


def infer_command(
    ctx: typer.Context,
    spec_path: Annotated[Path | None, options.spec_argument()] = None,
    language: Annotated[str | None, options.language_option()] = None,
    templates_path: Annotated[Path | None, options.templates_option()] = None,
    output_path: Annotated[Path | None, options.output_option()] = None,
    only: Annotated[str | None, options.only_option()] = None,
    show_context: Annotated[
        bool,
        typer.Option("--show-context", help="Show generation context summaries."),
    ] = False,
    show_paths: Annotated[
        bool,
        typer.Option("--show-paths", help="Print planned paths only."),
    ] = False,
    interactive: Annotated[bool, options.interactive_option()] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Show what would be generated."""

    try:
        resolved_spec_path = options.resolve_spec_path(spec_path, interactive=interactive)
        resolved_language = options.resolve_language(language, interactive=interactive)
        resolved_templates_path = options.resolve_templates_path(
            templates_path,
            language=resolved_language,
            interactive=interactive,
        )
        resolved_output_path = options.resolve_output_path(output_path, interactive=interactive)
        resolved_only = options.resolve_only(only, interactive=interactive)
        request = InferRequest(
            spec_path=resolved_spec_path,
            language=resolved_language,
            templates_path=resolved_templates_path,
            output_path=resolved_output_path,
            only=resolved_only,
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
