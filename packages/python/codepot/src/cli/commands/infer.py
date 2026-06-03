"""Infer command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import InferRequest
from cli import options
from cli.constants.exit_codes import EXIT_GENERATION_ERROR
from cli.constants.options import (
    HELP_SHOW_CONTEXT,
    HELP_SHOW_DEPENDENCIES,
    HELP_SHOW_IMPORTS,
    HELP_SHOW_PATHS,
)
from cli.errors import CliError
from cli.presentation.console import print_error
from cli.presentation.infer import render_infer_result
from cli.presentation.json import print_json_result
from cli.state import get_runtime


def infer_command(
    ctx: typer.Context,
    spec_path: Annotated[Path | None, options.spec_argument()] = None,
    language: Annotated[str | None, options.language_option()] = None,
    template_package_path: Annotated[Path | None, options.templates_option()] = None,
    output_path: Annotated[Path | None, options.output_option()] = None,
    select: Annotated[str | None, options.select_option()] = None,
    template: Annotated[list[str] | None, options.template_option()] = None,
    only: Annotated[str | None, options.only_option()] = None,
    show_context: Annotated[
        bool,
        typer.Option("--show-context", help=HELP_SHOW_CONTEXT),
    ] = False,
    show_paths: Annotated[
        bool,
        typer.Option("--show-paths", help=HELP_SHOW_PATHS),
    ] = False,
    show_imports: Annotated[bool, typer.Option("--show-imports", help=HELP_SHOW_IMPORTS)] = False,
    show_dependencies: Annotated[
        bool,
        typer.Option("--show-dependencies", help=HELP_SHOW_DEPENDENCIES),
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
        resolved_template_package_path = options.resolve_template_package_path(
            template_package_path,
            interactive=interactive,
        )
        resolved_output_path = options.resolve_output_path(output_path, interactive=interactive)
        resolved_select = options.resolve_select(select, interactive=interactive)
        resolved_template_ids = options.resolve_template_ids(
            template,
            only,
            interactive=interactive,
        )
        resolved_show_paths = options.resolve_show_paths(show_paths, interactive=interactive)
        resolved_show_context = options.resolve_show_context(show_context, interactive=interactive)
        resolved_show_imports = options.resolve_show_imports(show_imports, interactive=interactive)
        resolved_show_dependencies = options.resolve_show_dependencies(
            show_dependencies,
            interactive=interactive,
        )
        request = InferRequest(
            spec_path=resolved_spec_path,
            language=resolved_language,
            template_package_path=resolved_template_package_path,
            output_path=resolved_output_path,
            select=resolved_select,
            template_ids=resolved_template_ids,
            show_context=resolved_show_context,
            show_paths=resolved_show_paths,
            show_imports=resolved_show_imports,
            show_dependencies=resolved_show_dependencies,
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
