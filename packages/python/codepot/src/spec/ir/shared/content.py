"""Content type models for compiled Codepot IR."""

from __future__ import annotations

from enum import StrEnum

from pydantic import ConfigDict

from codepot.ir.shared.base import DefinitionItem


class ContentStrategy(StrEnum):
    """Supported content serialization strategies."""

    JSON = "json"
    XML = "xml"
    YAML = "yaml"
    HTML = "html"
    CSV = "csv"
    MULTIPART = "multipart"
    FORM = "form"
    TEXT = "text"
    BINARY = "binary"
    STREAM = "stream"
    GRAPHQL = "graphql"
    PROTOBUF = "protobuf"
    MSGPACK = "msgpack"
    CUSTOM = "custom"


class ContentTypeDefinition(DefinitionItem):
    """Reusable content type definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    type: str
    strategy: ContentStrategy
    binary: bool | None = None
    structured: bool | None = None
