"""Emit command."""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.constants.defaults import DEFAULT_OUTPUT_PATH, DEFAULT_TEMPLATE_PACKAGE_PATH
from cli.presentation.console import print_error
from cli.presentation.pipeline import print_pipeline_event, print_pipeline_report
from pipeline.contracts.options import PipelineOptions
from pipeline.contracts.results import PassStatus


def emit_command(
    spec_path: Path = typer.Argument(..., help="Path to compiled Codepot spec."),
    template_package_path: Path = typer.Option(
        DEFAULT_TEMPLATE_PACKAGE_PATH,
        "--template-package",
        "-t",
        help="Path to template package folder or codepotx config file.",
    ),
    output_path: Path = typer.Option(
        DEFAULT_OUTPUT_PATH,
        "--output",
        "-o",
        help="Output directory.",
    ),
    language: str | None = typer.Option(None, "--language", "-l"),
    select: list[str] = typer.Option([], "--select"),
    template_ids: list[str] = typer.Option([], "--template"),
    dry_run: bool = typer.Option(False, "--dry-run"),
    debug: bool = typer.Option(False, "--debug"),
    verbose: bool = typer.Option(False, "--verbose", "-v"),
    no_render: bool = typer.Option(False, "--no-render"),
    no_write: bool = typer.Option(False, "--no-write"),
    no_graph: bool = typer.Option(False, "--no-graph"),
) -> None:
    """Run the full emission pipeline."""

    options = PipelineOptions(
        spec_path=spec_path,
        template_package_path=template_package_path,
        output_path=output_path,
        language=language,
        select=tuple(select),
        template_ids=tuple(template_ids),
        dry_run=dry_run,
        debug=debug,
        verbose=verbose,
        render=not no_render,
        write=not no_write,
        write_graph=not no_graph,
    )

    try:
        result = codepotx.emit(
            options,
            reporter=print_pipeline_event if verbose or debug else None,
        )
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_pipeline_report(result.report)

    if result.report.status == PassStatus.FAILED:
        raise typer.Exit(code=1)
