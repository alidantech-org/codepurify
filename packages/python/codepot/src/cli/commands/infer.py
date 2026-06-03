"""Plan command.

This replaces the old fake infer command. It runs the pipeline in planning mode.
"""

from __future__ import annotations

from pathlib import Path

import typer

from app import codepotx
from cli.constants.defaults import DEFAULT_OUTPUT_PATH, DEFAULT_TEMPLATE_PACKAGE_PATH
from cli.presentation.console import print_error
from cli.presentation.pipeline import print_pipeline_event, print_pipeline_report
from pipeline.contracts.options import PipelineOptions
from pipeline.contracts.results import PassStatus

app = typer.Typer(help="Plan generated files without rendering or writing.")

SPEC_PATH_ARGUMENT = typer.Argument(..., help="Path to compiled Codepot spec.")
TEMPLATE_PACKAGE_OPTION = typer.Option(
    DEFAULT_TEMPLATE_PACKAGE_PATH,
    "--template-package",
    "-t",
    help="Path to template package folder or codepotx config file.",
)
OUTPUT_PATH_OPTION = typer.Option(DEFAULT_OUTPUT_PATH, "--output", "-o")
LANGUAGE_OPTION = typer.Option(None, "--language", "-l")
SELECT_OPTION = typer.Option([], "--select")
TEMPLATE_IDS_OPTION = typer.Option([], "--template")
DEBUG_OPTION = typer.Option(False, "--debug")
VERBOSE_OPTION = typer.Option(False, "--verbose", "-v")


@app.callback(invoke_without_command=True)
def plan(
    spec_path: Path = SPEC_PATH_ARGUMENT,
    template_package_path: Path = TEMPLATE_PACKAGE_OPTION,
    output_path: Path = OUTPUT_PATH_OPTION,
    language: str | None = LANGUAGE_OPTION,
    select: list[str] = SELECT_OPTION,
    template_ids: list[str] = TEMPLATE_IDS_OPTION,
    debug: bool = DEBUG_OPTION,
    verbose: bool = VERBOSE_OPTION,
) -> None:
    """Run planning pipeline."""

    options = PipelineOptions(
        spec_path=spec_path,
        template_package_path=template_package_path,
        output_path=output_path,
        language=language,
        select=tuple(select),
        template_ids=tuple(template_ids),
        dry_run=True,
        debug=debug,
        verbose=verbose,
        render=False,
        write=False,
        write_graph=False,
    )

    try:
        result = codepotx.plan(
            options,
            reporter=print_pipeline_event if verbose or debug else None,
        )
    except Exception as error:
        print_error(str(error))
        raise typer.Exit(code=1) from error

    print_pipeline_report(result.report)

    if result.report.status == PassStatus.FAILED:
        raise typer.Exit(code=1)
