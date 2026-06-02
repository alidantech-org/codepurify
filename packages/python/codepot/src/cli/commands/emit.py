"""Emit command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import EmitRequest
from cli import options
from cli.constants.defaults import DEFAULT_LANGUAGE, DEFAULT_OUTPUT_PATH, DEFAULT_SPEC_PATH
from cli.constants.exit_codes import EXIT_CONFIG_ERROR, EXIT_GENERATION_ERROR
from cli.errors import CliError, ConfigError
from cli.presentation.console import print_error
from cli.presentation.emit import render_emit_result
from cli.presentation.json import print_json_result
from cli.presentation.prompts import (
    ask_confirm_emit,
    ask_dry_run,
    ask_language,
    ask_only_groups,
    ask_output_path,
    ask_spec_path,
    ask_templates_path,
)
from cli.state import get_runtime


def emit_command(
    ctx: typer.Context,
    spec_path: Annotated[Path, options.spec_argument()] = DEFAULT_SPEC_PATH,
    language: Annotated[str, options.language_option()] = DEFAULT_LANGUAGE,
    templates_path: Annotated[Path | None, options.templates_option()] = None,
    output_path: Annotated[Path, options.output_option()] = DEFAULT_OUTPUT_PATH,
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

        resolved_only = options.parse_only(only)
        if interactive:
            spec_path = ask_spec_path(spec_path)
            language = ask_language(language)
            templates_path = ask_templates_path(templates_path)
            output_path = ask_output_path(output_path)
            resolved_only = ask_only_groups()
            dry_run = ask_dry_run(dry_run)
            if not dry_run and not ask_confirm_emit():
                raise ConfigError("Emit cancelled.")

        request = EmitRequest(
            spec_path=spec_path,
            language=language,
            templates_path=templates_path,
            output_path=output_path,
            only=resolved_only,
            dry_run=dry_run,
            force=force,
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
