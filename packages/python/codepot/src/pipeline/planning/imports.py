"""File-level import/export planning models and helpers."""

from __future__ import annotations

from dataclasses import dataclass

from contracts.language.exports import LanguageExport, LanguageExportStrategy
from contracts.language.imports import LanguageImport
from contracts.language.interface import (
    LanguageAdapter,
    LanguageExportRequest,
    LanguageExportTarget,
    LanguageImportRequest,
    LanguageImportTarget,
)
from contracts.language.runtime import LanguageRuntime
from contracts.spec.records import SpecRecord
from pipeline.planning.files import PlannedOutputFile


@dataclass(frozen=True)
class PlannedFileImportsExports:
    """Imports and exports planned for one output file."""

    file_id: str
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]


@dataclass(frozen=True)
class PlannedImportsExports:
    """All file-level imports and exports."""

    files: tuple[PlannedFileImportsExports, ...]


@dataclass(frozen=True)
class RecordOutputIndex:
    """Index from spec record id to planned output file."""

    items: dict[str, PlannedOutputFile]

    def find_file_for_record(
        self,
        record: SpecRecord[object],
    ) -> PlannedOutputFile | None:
        """Find the planned file that emits a record."""

        return self.items.get(record.id)


def build_record_output_index(
    files: tuple[PlannedOutputFile, ...],
) -> RecordOutputIndex:
    """Build record-to-file index from planned output files."""

    index: dict[str, PlannedOutputFile] = {}

    for file in files:
        if file.is_barrel or file.is_static or file.render_once:
            continue

        for record in file.source.records:
            index[record.id] = file

    return RecordOutputIndex(items=index)


def _import_targets_for_file(
    *,
    file: PlannedOutputFile,
    index: RecordOutputIndex,
) -> tuple[LanguageImportTarget, ...]:
    """Build import targets for one planned file.

    Dependency target resolution requires typed dependency target ids. Until
    SpecDependency exposes resolved target ids, imports are intentionally empty.
    """

    return ()


def _export_targets_for_file(
    file: PlannedOutputFile,
) -> tuple[LanguageExportTarget, ...]:
    """Build export targets for records emitted by one file.

    Normal files usually do not need export-from lines. Barrel export planning
    will add targets later.
    """

    return ()


def _export_strategy_for_file(file: PlannedOutputFile) -> LanguageExportStrategy:
    """Resolve export strategy for one file."""

    if not file.is_barrel:
        return LanguageExportStrategy.NAMED

    return LanguageExportStrategy(file.template.barrel_export)


def plan_file_imports_exports(
    *,
    file: PlannedOutputFile,
    index: RecordOutputIndex,
    adapter: LanguageAdapter,
    runtime: LanguageRuntime,
) -> PlannedFileImportsExports:
    """Plan imports/exports for one planned output file."""

    import_targets = _import_targets_for_file(file=file, index=index)
    export_targets = _export_targets_for_file(file)

    imports = adapter.create_imports(
        LanguageImportRequest(
            source_path=file.output_path,
            targets=import_targets,
            runtime=runtime,
        )
    )

    exports = adapter.create_exports(
        LanguageExportRequest(
            source_path=file.output_path,
            targets=export_targets,
            strategy=_export_strategy_for_file(file),
            runtime=runtime,
        )
    )

    return PlannedFileImportsExports(
        file_id=file.id,
        imports=imports,
        exports=exports,
    )


def plan_imports_exports(
    *,
    files: tuple[PlannedOutputFile, ...],
    adapter: LanguageAdapter,
    runtime: LanguageRuntime,
) -> PlannedImportsExports:
    """Plan file-level imports and exports for all files."""

    index = build_record_output_index(files)

    return PlannedImportsExports(
        files=tuple(
            plan_file_imports_exports(
                file=file,
                index=index,
                adapter=adapter,
                runtime=runtime,
            )
            for file in files
        )
    )