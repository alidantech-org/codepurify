"""Output file planning helpers."""

from __future__ import annotations

from pathlib import Path

from contracts.language.runtime import LanguageRuntime
from contracts.spec.context import SpecContext
from contracts.spec.records import SpecRecord
from contracts.templates.config.output import TemplateOutputPathConfig
from contracts.templates.config.package import LoadedTemplatePackageConfig
from contracts.templates.config.selection import TemplateSelectMode
from contracts.templates.config.template import TemplateEntryKind
from pipeline.planning.files import PlannedOutputFile, PlannedOutputSource
from pipeline.planning.path_expander import (
    ExpandedPathPart,
    expand_path_parts,
    join_expanded_path,
)
from pipeline.planning.path_variables import (
    OutputPathVariables,
    PathGlobalVariables,
    PathProjectVariables,
    item_variables,
    language_variables,
    owner_variables,
    template_variables,
)
from pipeline.planning.selections import PlannedSelection


def _relative_output_path(
    *,
    output_root: Path,
    output_path: Path,
) -> str:
    """Return POSIX relative output path."""

    return output_path.relative_to(output_root).as_posix()


def _file_id(
    *,
    template_id: str,
    index: int,
    bucket_key: str | None = None,
    record: SpecRecord[object] | None = None,
) -> str:
    """Create deterministic planned file id."""

    if record is not None:
        return f"file.{template_id}.{record.id}"

    if bucket_key is not None:
        return f"file.{template_id}.bucket.{bucket_key}"

    return f"file.{template_id}.{index}"


def _sources_for_selection(
    selection: PlannedSelection,
) -> tuple[PlannedOutputSource, ...]:
    """Create output sources for one selection."""

    if selection.select.mode == TemplateSelectMode.ONCE:
        return (PlannedOutputSource(records=()),)

    if selection.select.mode == TemplateSelectMode.ALL:
        return (PlannedOutputSource(records=selection.records),)

    if selection.select.mode == TemplateSelectMode.EACH:
        return tuple(
            PlannedOutputSource(records=(record,)) for record in selection.records
        )

    if selection.select.mode in {
        TemplateSelectMode.BY_OWNER,
        TemplateSelectMode.BY_RESOURCE,
    }:
        return tuple(
            PlannedOutputSource(records=bucket.records, bucket_key=bucket.key)
            for bucket in selection.buckets
        )

    raise ValueError(f"Unsupported selection mode: {selection.select.mode}")


def _path_variables(
    *,
    selection: PlannedSelection,
    source: PlannedOutputSource,
    runtime: LanguageRuntime,
    spec_context: SpecContext,
    template_package: LoadedTemplatePackageConfig,
) -> OutputPathVariables:
    """Create lightweight typed output path variables."""

    first_record = source.records[0] if source.records else None

    return OutputPathVariables(
        global_context=PathGlobalVariables(
            alias=template_package.config.defaults.global_alias,
            output_root=template_package.package_path,
        ),
        project=PathProjectVariables(
            key=spec_context.metadata.project.project_key,
            version=str(spec_context.metadata.project.version),
            title=spec_context.metadata.project.title,
        ),
        language=language_variables(runtime),
        template=template_variables(selection),
        item=item_variables(first_record) if first_record is not None else None,
        owner=owner_variables(first_record) if first_record is not None else None,
        resource=None,
    )


def _plan_file(
    *,
    selection: PlannedSelection,
    output_root: Path,
    path_config: TemplateOutputPathConfig,
    source: PlannedOutputSource,
    index: int,
    runtime: LanguageRuntime,
    spec_context: SpecContext,
    template_package: LoadedTemplatePackageConfig,
) -> PlannedOutputFile:
    """Create one planned output file."""

    variables = _path_variables(
        selection=selection,
        source=source,
        runtime=runtime,
        spec_context=spec_context,
        template_package=template_package,
    )

    try:
        folders = expand_path_parts(path_config.folders, variables)
        file_parts: tuple[ExpandedPathPart, ...] = expand_path_parts(
            (path_config.file,),
            variables,
        )
    except ValueError as error:
        raise ValueError(
            f"Failed to expand output path for template '{selection.template_id}': {error}"
        ) from error
    if len(file_parts) != 1:
        raise ValueError(f"Output file path did not expand correctly: {path_config.file}")

    output_path = join_expanded_path(
        output_root=output_root,
        folders=folders,
        file=file_parts[0],
    )

    record = source.records[0] if len(source.records) == 1 else None

    return PlannedOutputFile(
        id=_file_id(
            template_id=selection.template_id,
            index=index,
            bucket_key=source.bucket_key,
            record=record,
        ),
        template_id=selection.template_id,
        template=selection.template,
        select=selection.select,
        output_path=output_path,
        relative_output_path=_relative_output_path(
            output_root=output_root,
            output_path=output_path,
        ),
        source=source,
        is_barrel=selection.template.kind == TemplateEntryKind.BARREL,
    )


def plan_output_files(
    *,
    selections: tuple[PlannedSelection, ...],
    output_root: Path,
    runtime: LanguageRuntime,
    spec_context: SpecContext,
    template_package: LoadedTemplatePackageConfig,
) -> tuple[PlannedOutputFile, ...]:
    """Plan output files for all selections."""

    files: list[PlannedOutputFile] = []

    for selection in selections:
        sources = _sources_for_selection(selection)

        for path_config in selection.template.output.paths:
            for source in sources:
                files.append(
                    _plan_file(
                        selection=selection,
                        output_root=output_root,
                        path_config=path_config,
                        source=source,
                        index=len(files),
                        runtime=runtime,
                        spec_context=spec_context,
                        template_package=template_package,
                    )
                )

    return tuple(files)
