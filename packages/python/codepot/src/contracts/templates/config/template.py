"""Template entry config contracts."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator

from contracts.templates.config.barrel import TemplateBarrelConfig
from contracts.templates.config.output import TemplateOutputConfig
from contracts.templates.config.resolve import TemplateResolveMap


class TemplateEntryKind(StrEnum):
    """Kinds of template output entries."""

    SOURCE = "source"
    BARREL = "barrel"
    PACKAGE = "package"
    CONFIG = "config"
    DOCS = "docs"
    STATIC = "static"
    TEST = "test"
    OTHER = "other"


class TemplateEntryConfig(BaseModel):
    """One entry under ``templates.<id>`` in codepotx config."""

    model_config = ConfigDict(frozen=True, populate_by_name=True)

    kind: TemplateEntryKind
    select: str

    template: str | None = None
    copy_file: str | None = Field(default=None, alias="copy")

    output: TemplateOutputConfig
    resolves: TemplateResolveMap = {}
    barrel: TemplateBarrelConfig | None = None

    @model_validator(mode="after")
    def validate_source(self) -> "TemplateEntryConfig":  # noqa: UP037
        """Ensure exactly one source mode is configured."""

        has_template = self.template is not None
        has_copy = self.copy_file is not None

        if has_template == has_copy:
            raise ValueError(
                "Template entry must define exactly one of template or copy."
            )

        return self
