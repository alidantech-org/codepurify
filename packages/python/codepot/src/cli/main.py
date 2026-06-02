"""Codepot CLI entrypoint."""

from __future__ import annotations

from typing import Protocol

import typer

from app import GeneratorApp
from cli.commands.emit import emit_command
from cli.commands.infer import infer_command
from cli.commands.inspect import inspect_command
from cli.commands.validate import validate_command

RUNTIME_KEY = "runtime"


class RuntimeApi(Protocol):
    """Runtime methods the CLI is allowed to call."""

    def validate(self, **kwargs): ...

    def inspect(self, **kwargs): ...

    def infer(self, **kwargs): ...

    def emit(self, **kwargs): ...


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
    name="codepot",
    help="Universal code generator powered by Codepot compiled specs.",
    add_completion=False,
    no_args_is_help=True,
)


@app.callback()
def main(ctx: typer.Context) -> None:
    """Initialize CLI runtime state."""

    set_runtime(ctx, GeneratorApp())


@app.command("version", help="Show version and exit.")
def version_command() -> None:
    """Show CLI version."""

    typer.echo("codepot 0.1.0")


app.command("validate", help="Validate a Codepot spec.")(validate_command)
app.command("inspect", help="Inspect a Codepot spec.")(inspect_command)
app.command("infer", help="Show what would be generated.")(infer_command)
app.command("emit", help="Generate files.")(emit_command)


if __name__ == "__main__":
    app()
