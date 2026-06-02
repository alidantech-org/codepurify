"""Params definition models for compiled Codepot IR."""

from __future__ import annotations

from typing import Any

from pydantic import ConfigDict

from codepot.ir.shared.base import DefinitionItem
from codepot.ir.shared.ref import Ref


class ParamsDefinition(DefinitionItem):
    """Reusable params definition backed by one entity field ref."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    ref: Ref[Any]
