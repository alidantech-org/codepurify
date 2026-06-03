"""Pipeline state contract."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from contracts.language.interface import LanguageAdapter
from contracts.language.runtime import LanguageRuntime
from contracts.spec.context import SpecContext
from contracts.templates.config.package import LoadedTemplatePackageConfig
from pipeline.contracts.options import PipelineOptions
from pipeline.emission.renderer import RenderedFiles
from pipeline.emission.writer import FileWriteResults
from pipeline.planning.contexts import PlannedTemplateContexts
from pipeline.planning.dependencies import PlannedFileDependencies
from pipeline.planning.files import PlannedOutputFile
from pipeline.planning.imports import PlannedImportsExports
from pipeline.planning.language import PlannedLanguageEnrichment
from pipeline.planning.selections import PlannedSelection
from spec.repository.repository import SpecRepository

if TYPE_CHECKING:
    from pipeline.templates.validator import TemplateValidationResult


@dataclass(frozen=True)
class PipelineState:
    """Immutable state passed through all pipeline passes."""

    options: PipelineOptions

    spec_repository: SpecRepository | None = None
    spec_context: SpecContext | None = None

    template_package: LoadedTemplatePackageConfig | None = None
    template_validation: TemplateValidationResult | None = None

    language_adapter: LanguageAdapter | None = None
    language_runtime: LanguageRuntime | None = None

    # Later batches will replace these with typed planning/emission models.
    selections: tuple[PlannedSelection, ...] = ()
    output_files: tuple[PlannedOutputFile, ...] = ()
    file_dependencies: PlannedFileDependencies | None = None
    language_enrichment: PlannedLanguageEnrichment | None = None
    imports_exports: PlannedImportsExports | None = None
    template_contexts: PlannedTemplateContexts | None = None
    rendered_files: RenderedFiles | None = None
    write_results: FileWriteResults | None = None
