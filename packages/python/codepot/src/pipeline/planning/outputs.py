"""Output file planning helpers."""

from __future__ import annotations

from pathlib import Path

from contracts.language.runtime import LanguageRuntime
from contracts.spec.context import SpecContext
from contracts.spec.records import SpecRecord
from contracts.templates.config.output import TemplateOutputPathConfig
from contracts.templates.config.package import LoadedTemplatePackageConfig
from contracts.templates.config.selection import TemplateSelectMode, TemplateSelectSubject
from contracts.templates.config.template import TemplateEntryKind
from pipeline.planning.files import PlannedOutputFile, PlannedOutputSource
from pipeline.planning.path_debug import PathPlanningDebug
from pipeline.planning.path_expander import (
    expand_path_parts,
    join_expanded_path,
)
from pipeline.planning.path_variables import (
    OutputPathVariables,
    PathGlobalVariables,
    PathProjectVariables,
    PathResourceVariables,
    global_owner_variables,
    item_variables,
    language_variables,
    name_variables,
    owner_variables,
    owner_variables_from_key,
    template_variables,
)
from pipeline.planning.selections import PlannedSelection
from spec.ir.resource.definition import ResourceDefinition
from spec.repository.names import create_spec_name
from spec.utils.constants import GLOBAL_OWNER_KEY


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
            PlannedOutputSource(
                records=bucket.records,
                bucket_key=bucket.key,
                resource_key=(
                    bucket.key
                    if selection.select.mode == TemplateSelectMode.BY_RESOURCE
                    else None
                ),
            )
            for bucket in selection.buckets
        )

    raise ValueError(f"Unsupported selection mode: {selection.select.mode}")


def _resource_variables(
    *,
    selection: PlannedSelection,
    source: PlannedOutputSource,
    first_record: SpecRecord[object] | None,
) -> PathResourceVariables | None:
    """Create resource variables for output paths."""

    if selection.select.subject == TemplateSelectSubject.RESOURCES:
        if first_record is None:
            return None
        if not isinstance(first_record.data, ResourceDefinition):
            raise ValueError(f"Expected resource record data: {first_record.key}")
        return PathResourceVariables(
            key=first_record.key,
            name=name_variables(first_record.name),
            folders=tuple(first_record.data.folders),
        )

    if source.resource_key is not None:
        name = create_spec_name(source.resource_key)
        folders = first_record.owner.folders if first_record is not None else ()
        if not folders:
            raise ValueError(
                f"Resource folders were not resolved for resource '{source.resource_key}'."
            )
        return PathResourceVariables(
            key=source.resource_key,
            name=name_variables(name),
            folders=folders,
        )

    return None


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

    record_owner = owner_variables(first_record) if first_record is not None else None

    source_owner = (
        owner_variables_from_key(source.bucket_key)
        if source.bucket_key is not None
        else None
    )

    # Prioritize record_owner (has actual folder info) over source_owner (bucket key only)
    owner = record_owner or source_owner

    if owner is not None and owner.key == GLOBAL_OWNER_KEY:
        owner = global_owner_variables(
            alias=template_package.config.defaults.global_alias,
            folders=template_package.config.defaults.global_folders,
        )

    resource = _resource_variables(
        selection=selection,
        source=source,
        first_record=first_record,
    )

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
        owner=owner,
        resource=resource,
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
        folder_result = expand_path_parts(path_config.folders, variables)
        file_result = expand_path_parts((path_config.file,), variables)
    except ValueError as error:
        raise ValueError(
            f"Failed to expand output path for template '{selection.template_id}': {error}"
        ) from error

    folders = folder_result.parts
    file_parts = file_result.parts
    reads = folder_result.reads + file_result.reads

    if len(file_parts) != 1:
        raise ValueError(f"Output file path did not expand correctly: {path_config.file}")

    output_path = join_expanded_path(
        output_root=output_root,
        folders=folders,
        file=file_parts[0],
    )

    record = source.records[0] if len(source.records) == 1 else None

    path_debug = PathPlanningDebug(
        template_id=selection.template_id,
        source_key=source.bucket_key or (source.records[0].key if source.records else None),
        original_folders=path_config.folders,
        original_file=path_config.file,
        expanded_folders=tuple(folder.value for folder in folders),
        expanded_file=file_parts[0].value,
        variable_reads=reads,
        owner_key=variables.owner.key if variables.owner is not None else None,
        owner_folders=variables.owner.folders if variables.owner is not None else (),
        resource_key=variables.resource.key if variables.resource is not None else None,
        resource_folders=variables.resource.folders if variables.resource is not None else (),
    )

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
        path_debug=path_debug,
        template_file=selection.template.template,
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

    # Plan embedded barrel files
    barrel_files = _plan_embedded_barrel_files(
        selections=selections,
        normal_files=tuple(files),
        output_root=output_root,
        runtime=runtime,
        spec_context=spec_context,
        template_package=template_package,
    )

    return tuple(files + list(barrel_files))


def _plan_embedded_barrel_files(
    *,
    selections: tuple[PlannedSelection, ...],
    normal_files: tuple[PlannedOutputFile, ...],
    output_root: Path,
    runtime: LanguageRuntime,
    spec_context: SpecContext,
    template_package: LoadedTemplatePackageConfig,
) -> tuple[PlannedOutputFile, ...]:
    """Plan embedded barrel files from parent templates."""

    barrel_files: list[PlannedOutputFile] = []

    for selection in selections:
        barrel_config = selection.template.barrel
        if barrel_config is None or not barrel_config.enabled:
            continue

        # Group normal files by this selection by their barrel path context
        # Files are grouped by owner/resource folders to determine barrel location
        file_groups: dict[tuple[str, ...], list[PlannedOutputFile]] = {}

        for file in normal_files:
            if file.template_id != selection.template_id:
                continue

            # Group by expanded folders (owner/resource context)
            group_key = (
                file.path_debug.expanded_folders
                if file.path_debug is not None
                else ()
            )

            file_groups.setdefault(group_key, []).append(file)

        # Create one barrel file per group
        for group_files in file_groups.values():
            if not group_files:
                continue

            # Use the first file's source for path variables
            first_file = group_files[0]
            source = first_file.source

            # Build path variables using the same logic as normal files
            variables = _path_variables(
                selection=selection,
                source=source,
                runtime=runtime,
                spec_context=spec_context,
                template_package=template_package,
            )

            # Expand barrel output paths
            for path_config in barrel_config.output.paths:
                try:
                    folder_result = expand_path_parts(path_config.folders, variables)
                    file_result = expand_path_parts((path_config.file,), variables)
                except ValueError as error:
                    raise ValueError(
                        f"Failed to expand barrel output path for template "
                        f"'{selection.template_id}': {error}"
                    ) from error

                folders = folder_result.parts
                file_parts = file_result.parts
                reads = folder_result.reads + file_result.reads

                if len(file_parts) != 1:
                    raise ValueError(
                        f"Barrel file path did not expand correctly: {path_config.file}"
                    )

                output_path = join_expanded_path(
                    output_root=output_root,
                    folders=folders,
                    file=file_parts[0],
                )

                # Collect all records from source files in this group
                all_records: list[SpecRecord[object]] = []
                for f in group_files:
                    all_records.extend(f.source.records)

                # Build path debug for barrel
                path_debug = PathPlanningDebug(
                    template_id=selection.template_id,
                    source_key=(
                        source.bucket_key
                        or (source.records[0].key if source.records else None)
                    ),
                    original_folders=path_config.folders,
                    original_file=path_config.file,
                    expanded_folders=tuple(folder.value for folder in folders),
                    expanded_file=file_parts[0].value,
                    variable_reads=reads,
                    owner_key=variables.owner.key if variables.owner is not None else None,
                    owner_folders=variables.owner.folders if variables.owner is not None else (),
                    resource_key=(
                        variables.resource.key if variables.resource is not None else None
                    ),
                    resource_folders=(
                        variables.resource.folders if variables.resource is not None else ()
                    ),
                )

                barrel_file = PlannedOutputFile(
                    id=_file_id(
                        template_id=selection.template_id,
                        index=len(barrel_files) + len(normal_files),
                        bucket_key=source.bucket_key,
                        record=None,
                    ),
                    template_id=selection.template_id,
                    template=selection.template,
                    select=selection.select,
                    output_path=output_path,
                    relative_output_path=_relative_output_path(
                        output_root=output_root,
                        output_path=output_path,
                    ),
                    source=PlannedOutputSource(
                        records=tuple(all_records),
                        bucket_key=source.bucket_key,
                        resource_key=source.resource_key,
                    ),
                    is_barrel=True,
                    parent_template_id=selection.template_id,
                    path_debug=path_debug,
                    template_file=barrel_config.template,
                    barrel_source_file_ids=tuple(f.id for f in group_files),
                )

                barrel_files.append(barrel_file)

    return tuple(barrel_files)
