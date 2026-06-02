"""Emit command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import EmitRequest
from cli import options
from cli.constants.exit_codes import EXIT_CONFIG_ERROR, EXIT_GENERATION_ERROR
from cli.errors import CliError, ConfigError
from cli.presentation.console import print_error
from cli.presentation.emit import render_emit_result
from cli.presentation.json import print_json_result
from cli.state import get_runtime


def emit_command(
    ctx: typer.Context,
    spec_path: Annotated[Path | None, options.spec_argument()] = None,
    language: Annotated[str | None, options.language_option()] = None,
    templates_path: Annotated[Path | None, options.templates_option()] = None,
    output_path: Annotated[Path | None, options.output_option()] = None,
    only: Annotated[str | None, options.only_option()] = None,
    dry_run: Annotated[bool, typer.Option("--dry-run", help="Plan without writing files.")] = False,
    force: Annotated[bool, typer.Option("--force", help="Force overwrites.")] = False,
    watch: Annotated[bool, typer.Option("--watch", help="Watch and regenerate.")] = False,
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
        resolved_templates_path = options.resolve_templates_path(
            templates_path,
            language=resolved_language,
            interactive=interactive,
        )
        resolved_output_path = options.resolve_output_path(output_path, interactive=interactive)
        resolved_only = options.resolve_only(only, interactive=interactive)
        resolved_dry_run = options.resolve_dry_run(dry_run, interactive=interactive)
        resolved_force = options.resolve_force(force, interactive=interactive)

        request = EmitRequest(
            spec_path=resolved_spec_path,
            language=resolved_language,
            templates_path=resolved_templates_path,
            output_path=resolved_output_path,
            only=resolved_only,
            dry_run=resolved_dry_run,
            force=resolved_force,
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
