"""Template barrel config contracts."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, ConfigDict

from contracts.templates.config.output import TemplateOutputConfig


class TemplateBarrelExportStrategy(StrEnum):
    """Supported barrel export strategies."""

    NAMED = "named"
    STAR = "star"


class TemplateBarrelConfig(BaseModel):
    """Optional barrel output for a template entry.

    A barrel is not a normal selector. It receives the emitted files/symbols
    from its parent template entry.
    """

    model_config = ConfigDict(frozen=True)

    enabled: bool = True
    template: str
    output: TemplateOutputConfig
    export: TemplateBarrelExportStrategy = TemplateBarrelExportStrategy.NAMED
