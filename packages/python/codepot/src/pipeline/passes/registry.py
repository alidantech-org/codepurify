"""Pipeline pass registry."""

from __future__ import annotations

from pipeline.passes.base import PipelinePass
from pipeline.passes.p01_inputs import InputResolutionPass
from pipeline.passes.p02_spec_repository import SpecRepositoryPass
from pipeline.passes.p03_template_package import TemplatePackagePass


def create_default_passes() -> tuple[PipelinePass, ...]:
    """Create the default ordered pipeline pass list."""

    return (
        InputResolutionPass(),
        SpecRepositoryPass(),
        TemplatePackagePass(),
    )
