"""Template command group."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from app import (
    TemplateInspectRequest,
    TemplateSelectionsRequest,
    TemplateValidateRequest,
    TemplateVarsRequest,
)
from cli import options
from cli.constants.commands import (
    CMD_TEMPLATE_INSPECT,
    CMD_TEMPLATE_SELECTIONS,
    CMD_TEMPLATE_VALIDATE,
    CMD_TEMPLATE_VARS,
)
from cli.constants.exit_codes import EXIT_CONFIG_ERROR
from cli.constants.options import HELP_TEMPLATE_PACKAGE
from cli.errors import CliError
from cli.presentation.console import print_error, print_header
from cli.presentation.json import print_json_result
from cli.presentation.template import (
    render_template_inspect_result,
    render_template_selections_result,
    render_template_validate_result,
    render_template_vars_result,
)
from cli.state import get_runtime

template_app = typer.Typer(
    name="template",
    help="Inspect and validate Codepotx template packages.",
    no_args_is_help=True,
)


@template_app.command(CMD_TEMPLATE_VALIDATE, help="Validate a template package.")
def template_validate_command(
    ctx: typer.Context,
    template_package_path: Annotated[
        Path | None,
        typer.Argument(help=HELP_TEMPLATE_PACKAGE),
    ] = None,
    interactive: Annotated[bool, options.interactive_option()] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Validate a Codepotx template package."""

    try:
        resolved_path = options.resolve_template_package_path(
            template_package_path,
            interactive=interactive,
        )
        result = get_runtime(ctx).template_validate(
            TemplateValidateRequest(template_package_path=resolved_path),
        )
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            print_header("Template Validate", str(result.template_package_path))
            render_template_validate_result(result, verbose=verbose)
    except CliError as exc:
        _handle_error(exc, debug=debug, code=exc.exit_code)
    except Exception as exc:
        _handle_error(exc, debug=debug, code=EXIT_CONFIG_ERROR)


@template_app.command(CMD_TEMPLATE_INSPECT, help="Inspect a template package.")
def template_inspect_command(
    ctx: typer.Context,
    template_package_path: Annotated[
        Path | None,
        typer.Argument(help=HELP_TEMPLATE_PACKAGE),
    ] = None,
    interactive: Annotated[bool, options.interactive_option()] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """Inspect a Codepotx template package."""

    try:
        resolved_path = options.resolve_template_package_path(
            template_package_path,
            interactive=interactive,
        )
        result = get_runtime(ctx).template_inspect(
            TemplateInspectRequest(template_package_path=resolved_path),
        )
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            print_header("Template Package", str(result.template_package_path))
            render_template_inspect_result(result, verbose=verbose)
    except CliError as exc:
        _handle_error(exc, debug=debug, code=exc.exit_code)
    except Exception as exc:
        _handle_error(exc, debug=debug, code=EXIT_CONFIG_ERROR)


@template_app.command(CMD_TEMPLATE_VARS, help="Show template variables for a selection.")
def template_vars_command(
    ctx: typer.Context,
    template_package_path: Annotated[
        Path | None,
        typer.Argument(help=HELP_TEMPLATE_PACKAGE),
    ] = None,
    select: Annotated[str | None, options.select_option()] = None,
    interactive: Annotated[bool, options.interactive_option()] = False,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """List path and template variables for a selection."""

    try:
        resolved_path = options.resolve_template_package_path(
            template_package_path,
            interactive=interactive,
        )
        resolved_select = options.resolve_select(select, interactive=interactive, required=True)
        result = get_runtime(ctx).template_vars(
            TemplateVarsRequest(template_package_path=resolved_path, select=resolved_select or ""),
        )
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            render_template_vars_result(result, verbose=verbose)
    except CliError as exc:
        _handle_error(exc, debug=debug, code=exc.exit_code)
    except Exception as exc:
        _handle_error(exc, debug=debug, code=EXIT_CONFIG_ERROR)


@template_app.command(CMD_TEMPLATE_SELECTIONS, help="List valid template selections.")
def template_selections_command(
    ctx: typer.Context,
    json_output: Annotated[bool, options.json_option()] = False,
    quiet: Annotated[bool, options.quiet_option()] = False,
    verbose: Annotated[bool, options.verbose_option()] = False,
    debug: Annotated[bool, options.debug_option()] = False,
) -> None:
    """List valid template selections."""

    try:
        result = get_runtime(ctx).template_selections(TemplateSelectionsRequest(verbose=verbose))
        if json_output and not quiet:
            print_json_result(result)
        elif not quiet:
            render_template_selections_result(result, verbose=verbose)
    except CliError as exc:
        _handle_error(exc, debug=debug, code=exc.exit_code)
    except Exception as exc:
        _handle_error(exc, debug=debug, code=EXIT_CONFIG_ERROR)


def _handle_error(exc: Exception, *, debug: bool, code: int) -> None:
    print_error(str(exc))
    if debug:
        raise exc
    raise typer.Exit(code) from exc
