"""Emit command."""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.constants.defaults import DEFAULT_OUTPUT_PATH, DEFAULT_TEMPLATE_PACKAGE_PATH
from cli.presentation.console import print_error
from cli.presentation.pipeline import print_pipeline_event, print_pipeline_report
from pipeline.contracts.options import PipelineOptions

app = typer.Typer(help="Emit generated files.")

SPEC_PATH_ARGUMENT = typer.Argument(..., help="Path to compiled Codepot spec.")
TEMPLATE_PACKAGE_OPTION = typer.Option(
    DEFAULT_TEMPLATE_PACKAGE_PATH,
    "--template-package",
    "-t",
    help="Path to template package folder or codepotx config file.",
)
OUTPUT_PATH_OPTION = typer.Option(
    DEFAULT_OUTPUT_PATH,
    "--output",
    "-o",
    help="Output directory.",
)
LANGUAGE_OPTION = typer.Option(
    None,
    "--language",
    "-l",
    help="Override template package language.",
)
SELECT_OPTION = typer.Option(
    [],
    "--select",
    help="Only run templates matching this select expression.",
)
TEMPLATE_IDS_OPTION = typer.Option(
    [],
    "--template",
    help="Only run specific template ids.",
)
DRY_RUN_OPTION = typer.Option(False, "--dry-run", help="Plan writes without writing files.")
DEBUG_OPTION = typer.Option(False, "--debug", help="Enable debug output.")
VERBOSE_OPTION = typer.Option(False, "--verbose", "-v", help="Verbose output.")
NO_RENDER_OPTION = typer.Option(False, "--no-render", help="Skip rendering.")
NO_WRITE_OPTION = typer.Option(False, "--no-write", help="Skip file writing.")
NO_GRAPH_OPTION = typer.Option(False, "--no-graph", help="Skip emission graph artifact.")


@app.callback(invoke_without_command=True)
def emit( 
    spec_path: Path = SPEC_PATH_ARGUMENT,
    template_package_path: Path = TEMPLATE_PACKAGE_OPTION,
    output_path: Path = OUTPUT_PATH_OPTION,
    language: str | None = LANGUAGE_OPTION,
    select: list[str] = SELECT_OPTION,
    template_ids: list[str] = TEMPLATE_IDS_OPTION,
    dry_run: bool = DRY_RUN_OPTION,
    debug: bool = DEBUG_OPTION,
    verbose: bool = VERBOSE_OPTION,
    no_render: bool = NO_RENDER_OPTION,
    no_write: bool = NO_WRITE_OPTION,
    no_graph: bool = NO_GRAPH_OPTION,
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

    if result.report.status == "failed":
        raise typer.Exit(code=1)
