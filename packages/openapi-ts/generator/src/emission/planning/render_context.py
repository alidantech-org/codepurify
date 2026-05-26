"""Render context containers used by the emission planner."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from emission.model import TemplateContext
from emission.templates.descriptor import TemplateOwner

Context = Mapping[str, Any] | TemplateContext


@dataclass(frozen=True)
class RenderContexts:
    """Prepared contexts grouped by template owner."""

    global_context: Context
    schemas: Sequence[Context] = field(default_factory=tuple)
    dtos: Sequence[Context] = field(default_factory=tuple)
    operations: Sequence[Context] = field(default_factory=tuple)
    resources: Sequence[Context] = field(default_factory=tuple)
    barrels: Sequence[Context] = field(default_factory=tuple)
    fields: Sequence[Context] = field(default_factory=tuple)

    def for_owner(self, owner: TemplateOwner) -> Sequence[Context]:
        """Return contexts matching a template owner."""
        if owner is TemplateOwner.GLOBAL:
            return (self.global_context,)

        if owner is TemplateOwner.SCHEMA:
            return self.schemas

        if owner is TemplateOwner.DTO:
            return self.dtos

        if owner is TemplateOwner.OPERATION:
            return self.operations

        if owner is TemplateOwner.RESOURCE:
            return self.resources

        if owner is TemplateOwner.BARREL:
            return self.barrels

        if owner is TemplateOwner.FIELD:
            return self.fields

        return ()
