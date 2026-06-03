"""Pipeline pass registry."""

from __future__ import annotations

from pipeline.passes.base import PipelinePass
from pipeline.passes.p01_inputs import InputResolutionPass
from pipeline.passes.p02_spec_repository import SpecRepositoryPass
from pipeline.passes.p03_template_package import TemplatePackagePass
from pipeline.passes.p04_template_validation import TemplateValidationPass
from pipeline.passes.p05_language_runtime import LanguageRuntimePass
from pipeline.passes.p06_selection import SelectionPlanningPass
from pipeline.passes.p07_output_plan import OutputPlanningPass
from pipeline.passes.p08_dependencies import DependencyPlanningPass
from pipeline.passes.p09_language_enrichment import LanguageEnrichmentPass
from pipeline.passes.p10_imports_exports import ImportsExportsPass
from pipeline.passes.p11_template_context import TemplateContextPass
from pipeline.passes.p12_rendering import RenderingPass
from pipeline.passes.p13_writing import WritingPass
from pipeline.passes.p14_emission_graph import EmissionGraphPass


def create_default_passes() -> tuple[PipelinePass, ...]:
    """Create the default ordered pipeline pass list."""

    return (
        InputResolutionPass(),
        SpecRepositoryPass(),
        TemplatePackagePass(),
        TemplateValidationPass(),
        LanguageRuntimePass(),
        SelectionPlanningPass(),
        OutputPlanningPass(),
        DependencyPlanningPass(),
        LanguageEnrichmentPass(),
        ImportsExportsPass(),
        TemplateContextPass(),
        RenderingPass(),
        WritingPass(),
        EmissionGraphPass(),
    )
