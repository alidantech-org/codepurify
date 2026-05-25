from __future__ import annotations

import typer

from cli.commands.emit import emit_command
from cli.commands.infer import infer_command
from cli.commands.inspect import inspect_command
from cli.commands.validate import validate_command
from core.constants import APP_NAME
from core.logging import print_header

app = typer.Typer(
    name="generator",
    help="General OpenAPI inference and multi-language code generation engine.",
    add_completion=False,
    no_args_is_help=True,
    rich_markup_mode="rich",
)


@app.callback()
def main(
    version: bool = typer.Option(
        False,
        "--version",
        help="Show generator version.",
    ),
) -> None:
    if version:
        print_header(APP_NAME, "version 0.1.0")
        raise typer.Exit()


app.command(
    "inspect",
    help="Inspect an OpenAPI document and print a summary.",
)(inspect_command)

app.command(
    "infer",
    help="Run language-neutral OpenAPI inference.",
)(infer_command)

app.command(
    "emit",
    help="Emit generated code for a target language.",
)(emit_command)

app.command(
    "validate",
    help="Validate an OpenAPI document for generator compatibility.",
)(validate_command)


if __name__ == "__main__":
    app()
