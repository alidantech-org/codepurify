"""Infer command."""

from __future__ import annotations

from pathlib import Path

import typer


def _split_only(value: str | None) -> tuple[str, ...]:
    if not value:
        return ()
    return tuple(part.strip() for part in value.split(",") if part.strip())


def infer_command(
    ctx: typer.Context,
    spec_path: Path = typer.Argument(Path("codepot.v1.yaml"), help="Path to Codepot spec."),
    language: str = typer.Option("python", "--language", "-l", help="Target language."),
    templates_path: Path | None = typer.Option(None, "--templates", "-t", help="Templates path."),
    output_path: Path | None = typer.Option(None, "--out", "-o", help="Output root."),
    only: str | None = typer.Option(None, "--only", help="Comma-separated group ids."),
    show_context: bool = typer.Option(False, "--show-context", help="Show template context."),
    show_paths: bool = typer.Option(False, "--show-paths", help="Show paths only."),
    json_output: bool = typer.Option(False, "--json", help="Output machine-readable JSON."),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress normal output."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show extra details."),
    debug: bool = typer.Option(False, "--debug", help="Raise errors with traceback."),
) -> None:
    """Dry-run the generation pipeline."""

    try:
        from cli.main import get_runtime

        result = get_runtime(ctx).infer(
            spec_path=spec_path,
            language=language,
            templates_path=templates_path,
            output_path=output_path,
            only=_split_only(only),
            show_context=show_context,
            show_paths=show_paths,
        )

        if quiet:
            return

        typer.echo(f"Inferred {len(result.files)} files ({result.language})")
        typer.echo("")

        for file in result.files:
            if show_paths:
                typer.echo(str(file.path))
                continue

            typer.echo(f"  {str(file.path):28} {file.template:18} {file.kind}: {file.source}")

            if show_context:
                typer.echo("    context: fake context pending")

        typer.echo("")
        typer.echo("No files written. Run emit to generate.")

    except Exception as exc:
        typer.echo(f"Error: {exc}", err=True)
        if debug:
            raise
        raise typer.Exit(1) from exc
