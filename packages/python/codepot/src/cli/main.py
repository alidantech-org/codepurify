"""Codepotx CLI entrypoint."""

from __future__ import annotations

import typer

from cli.commands import emit, infer, inspect, template, validate

app = typer.Typer(
    name="cpx",
    help="Codepotx code generation CLI.",
    no_args_is_help=True,
)

app.add_typer(validate.app, name="validate")
app.add_typer(inspect.app, name="inspect")
app.add_typer(infer.app, name="plan")
app.add_typer(emit.app, name="emit")
app.add_typer(template.app, name="template")


def main() -> None:
    """Run CLI."""

    app()


if __name__ == "__main__":
    main()
