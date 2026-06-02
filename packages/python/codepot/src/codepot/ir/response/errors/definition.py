"""Error response definition models for compiled Codepot IR."""

from __future__ import annotations

from typing import Any

from pydantic import ConfigDict

from codepot.ir.shared.base import DefinitionItem
from codepot.ir.shared.ref import Ref


class ErrorResponseDefinition(DefinitionItem):
    """Reusable typed error response definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    status: int
    intent: str | None = None
    schema: Ref[Any]
    content_type: Ref[Any]
    headers: dict[str, Ref[Any]] | None = None
