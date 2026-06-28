# ruff: noqa: E402, I001

from __future__ import annotations

from typing import Protocol

from cli.bootstrap import ensure_src_on_path

ensure_src_on_path()

import typer

from app import GeneratorApp

from cli.commands.emit import emit_command
from cli.commands.infer import infer_command
from cli.commands.inspect import inspect_command
from cli.commands.validate import validate_command
from cli.constants.constants import (
    APP_DESCRIPTION,
    APP_NAME,
    APP_VERSION,
    CMD_EMIT,
    CMD_INFER,
    CMD_INSPECT,
    CMD_VALIDATE,
    HELP_EMIT,
    HELP_INFER,
    HELP_INSPECT,
    HELP_VALIDATE,
)
from cli.presentation.core.console import print_header

RUNTIME_KEY = "runtime"


class RuntimeApi(Protocol):
    """Runtime methods the CLI is allowed to call."""

    def emit(self, **kwargs):
        """Emit output for a target language."""

    def infer(self, **kwargs):
        """Run inference."""

    def inspect(self, **kwargs):
        """Inspect an OpenAPI document."""

    def validate(self, **kwargs):
        """Validate an OpenAPI document."""


def set_runtime(ctx: typer.Context, runtime: RuntimeApi) -> None:
    """Store runtime instance in Typer context."""
    if ctx.obj is None:
        ctx.obj = {}

    ctx.obj[RUNTIME_KEY] = runtime


def get_runtime(ctx: typer.Context) -> RuntimeApi:
    """Get runtime instance from Typer context."""
    if ctx.obj is None or RUNTIME_KEY not in ctx.obj:
        raise RuntimeError("CLI runtime was not initialized.")

    return ctx.obj[RUNTIME_KEY]


app = typer.Typer(
    name=APP_NAME,
    help=APP_DESCRIPTION,
    add_completion=False,
    no_args_is_help=True,
    rich_markup_mode="rich",
)


@app.callback()
def main(ctx: typer.Context) -> None:
    """Initialize CLI runtime state."""
    set_runtime(ctx, GeneratorApp())


@app.command("version", help="Show version and exit.")
def version_command() -> None:
    """Show the CLI version."""
    print_header(APP_NAME, APP_VERSION)


app.command(CMD_INSPECT, help=HELP_INSPECT)(inspect_command)
app.command(CMD_INFER, help=HELP_INFER)(infer_command)
app.command(CMD_EMIT, help=HELP_EMIT)(emit_command)
app.command(CMD_VALIDATE, help=HELP_VALIDATE)(validate_command)


if __name__ == "__main__":
    app()
