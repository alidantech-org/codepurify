"""Resource definition models for compiled Codepot IR."""

from __future__ import annotations

from typing import Any

from pydantic import ConfigDict

from spec.ir.resource.operation.definition import OperationDefinition
from spec.ir.resource.route.definition import RoutesDefinition
from spec.ir.shared.base import DefinitionItem
from spec.ir.shared.ref import Ref


class ResourceDefaultsDefinition(DefinitionItem):
    """Compiled resource default configuration."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    security: Ref[Any] | None = None


class ResourceDefinition(DefinitionItem):
    """Compiled API resource definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    base_path: str
    folders: list[str]
    defaults: ResourceDefaultsDefinition
    operations: dict[str, OperationDefinition]
    routes: RoutesDefinition
