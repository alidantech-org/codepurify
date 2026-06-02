"""Inspect command."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import InspectRequest
from cli import options
from cli.constants.defaults import DEFAULT_SPEC_PATH
from cli.constants.exit_codes import EXIT_CONFIG_ERROR
from cli.errors import CliError, ConfigError
from cli.presentation.console import print_error, print_header
from cli.presentation.inspect import render_inspect_result
from cli.presentation.json import print_json_result
from cli.state import get_runtime


def inspect_command(
    ctx: typer.Context,
    spec_path: Annotated[Path, options.spec_argument()] = DEFAULT_SPEC_PATH,
    schemas: Annotated[bool, typer.Option("--schemas", help="Inspect schemas.")] = False,
    resources: Annotated[bool, typer.Option("--resources", help="Inspect resources.")] = False,
    refs: Annotated[bool, typer.Option("--refs", help="Inspect refs.")] = False,
    content_types: Annotated[
        bool,
        typer.Option("--content-types", help="Inspect content types."),
    ] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Inspect a Codepot spec."""

    try:
        mode = _resolve_mode(schemas, resources, refs, content_types)
        request = InspectRequest(spec_path=spec_path, mode=mode, verbose=verbose)
        result = get_runtime(ctx).inspect(request)
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            print_header("Inspect", str(result.spec_path))
            render_inspect_result(result)
    except CliError as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(exc.exit_code) from exc
    except Exception as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(EXIT_CONFIG_ERROR) from exc


def _resolve_mode(schemas: bool, resources: bool, refs: bool, content_types: bool) -> str:
    modes = (
        ("schemas", schemas),
        ("resources", resources),
        ("refs", refs),
        ("content_types", content_types),
    )
    selected = tuple(mode for mode, enabled in modes if enabled)
    if len(selected) > 1:
        raise ConfigError("Choose only one inspect mode flag.")
    return selected[0] if selected else "overview"
