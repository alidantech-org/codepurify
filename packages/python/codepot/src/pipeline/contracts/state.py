"""Pipeline state contract."""

from __future__ import annotations

from dataclasses import dataclass

from contracts.language.interface import LanguageAdapter
from contracts.language.runtime import LanguageRuntime
from contracts.spec.context import SpecContext
from contracts.templates.config.package import LoadedTemplatePackageConfig
from pipeline.contracts.options import PipelineOptions
from spec.repository.repository import SpecRepository


@dataclass(frozen=True)
class PipelineState:
    """Immutable state passed through all pipeline passes."""

    options: PipelineOptions

    spec_repository: SpecRepository | None = None
    spec_context: SpecContext | None = None

    template_package: LoadedTemplatePackageConfig | None = None

    language_adapter: LanguageAdapter | None = None
    language_runtime: LanguageRuntime | None = None

    # Later batches will replace these with typed planning/emission models.
    selections_count: int = 0
    output_files_count: int = 0
    dependencies_count: int = 0
    rendered_files_count: int = 0
    written_files_count: int = 0
