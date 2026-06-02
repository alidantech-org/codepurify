"""Root compiled Codepot IR document model."""

from __future__ import annotations

from pydantic import ConfigDict

from codepot.ir.properties.definition import PropertiesDefinition
from codepot.ir.resource.definition import ResourceDefinition
from codepot.ir.response.definition import ResponsesDefinition
from codepot.ir.schema.definition import SchemasDefinition
from codepot.ir.security.definition import SecurityDefinition
from codepot.ir.shared.base import DefinitionItem
from codepot.ir.shared.content import ContentTypeDefinition
from codepot.ir.shared.info import InfoDefinition
from codepot.ir.shared.url import UrlDefinition


class CodepotDefinition(DefinitionItem):
    """Stable compiled Codepot IR document consumed by codegen."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    codepot: str
    key: str
    version: int

    info: InfoDefinition
    urls: list[UrlDefinition]

    content_types: dict[str, ContentTypeDefinition]
    properties: PropertiesDefinition
    schemas: SchemasDefinition
    responses: ResponsesDefinition
    security: SecurityDefinition
    resources: dict[str, ResourceDefinition]
