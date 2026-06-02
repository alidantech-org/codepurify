"""Field-set definition models for compiled Codepot IR."""

from __future__ import annotations

from typing import Any

from pydantic import ConfigDict

from codepot.ir.shared.base import DefinitionItem
from codepot.ir.shared.ref import Ref


class FieldSetDefinition(DefinitionItem):
    """Reusable list of entity field refs."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    fields: tuple[Ref[Any], ...]
