"""Emit command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import EmitRequest
from cli import options
from cli.constants.exit_codes import EXIT_CONFIG_ERROR, EXIT_GENERATION_ERROR
from cli.constants.options import (
    HELP_DRY_RUN,
    HELP_FORCE,
    HELP_FORMAT,
    HELP_RUN_HOOKS,
    HELP_SKIP_STATIC,
    HELP_WATCH,
)
from cli.errors import CliError, ConfigError
from cli.presentation.console import print_error
from cli.presentation.emit import render_emit_result
from cli.presentation.json import print_json_result
from cli.state import get_runtime


def emit_command(
    ctx: typer.Context,
    spec_path: Annotated[Path | None, options.spec_argument()] = None,
    language: Annotated[str | None, options.language_option()] = None,
    template_package_path: Annotated[Path | None, options.templates_option()] = None,
    output_path: Annotated[Path | None, options.output_option()] = None,
    select: Annotated[str | None, options.select_option()] = None,
    template: Annotated[list[str] | None, options.template_option()] = None,
    only: Annotated[str | None, options.only_option()] = None,
    dry_run: Annotated[bool, typer.Option("--dry-run", help=HELP_DRY_RUN)] = False,
    force: Annotated[bool, typer.Option("--force", help=HELP_FORCE)] = False,
    format_output: Annotated[bool, typer.Option("--format", help=HELP_FORMAT)] = False,
    run_hooks: Annotated[bool, typer.Option("--run-hooks", help=HELP_RUN_HOOKS)] = False,
    skip_static: Annotated[bool, typer.Option("--skip-static", help=HELP_SKIP_STATIC)] = False,
    watch: Annotated[bool, typer.Option("--watch", help=HELP_WATCH)] = False,
    interactive: Annotated[bool, options.interactive_option()] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Generate files from a Codepot spec."""

    try:
        if watch:
            raise ConfigError("--watch is not implemented yet.")

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
        resolved_dry_run = options.resolve_dry_run(dry_run, interactive=interactive)
        resolved_force = options.resolve_force(force, interactive=interactive)
        resolved_format = options.resolve_format(format_output, interactive=interactive)
        resolved_run_hooks = options.resolve_run_hooks(run_hooks, interactive=interactive)
        resolved_skip_static = options.resolve_skip_static(skip_static, interactive=interactive)

        request = EmitRequest(
            spec_path=resolved_spec_path,
            language=resolved_language,
            template_package_path=resolved_template_package_path,
            output_path=resolved_output_path,
            select=resolved_select,
            template_ids=resolved_template_ids,
            dry_run=resolved_dry_run,
            force=resolved_force,
            format=resolved_format,
            run_hooks=resolved_run_hooks,
            skip_static=resolved_skip_static,
            verbose=verbose,
        )
        result = get_runtime(ctx).emit(request)
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            render_emit_result(result)
        if result.errors:
            raise typer.Exit(EXIT_GENERATION_ERROR)
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
        raise typer.Exit(EXIT_CONFIG_ERROR) from exc
