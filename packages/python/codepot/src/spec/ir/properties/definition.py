"""Root property registry model for compiled Codepot IR."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from codepot.ir.properties.composite.definition import CompositeDefinition
from codepot.ir.properties.enum.definition import EnumDefinition
from codepot.ir.properties.primitive.definition import PrimitiveDefinition

RefProperty = PrimitiveDefinition | EnumDefinition | CompositeDefinition


class PropertiesDefinition(BaseModel):
    """Compiled reusable property registry."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    primitives: dict[str, PrimitiveDefinition]
    enums: dict[str, EnumDefinition]
    composites: dict[str, CompositeDefinition]
