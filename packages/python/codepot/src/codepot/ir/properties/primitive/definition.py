"""Primitive property definition models for compiled Codepot IR."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import ConfigDict

from codepot.ir.shared.base import DefinitionItem


class PrimitiveType(StrEnum):
    """Supported primitive value types."""

    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    INTEGER = "integer"


class PrimitiveFormat(StrEnum):
    """Supported primitive semantic formats."""

    DATE = "date"
    DATE_TIME = "date-time"
    TIME = "time"
    EMAIL = "email"
    URI = "uri"
    URL = "url"
    UUID = "uuid"
    OBJECT_ID = "object-id"
    PHONE = "phone"
    PASSWORD = "password"
    BINARY = "binary"
    CUSTOM = "custom"


class PrimitiveValidationDefinition(DefinitionItem):
    """Validation constraints for primitive properties."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    minimum: float | None = None
    maximum: float | None = None
    exclusive_minimum: float | None = None
    exclusive_maximum: float | None = None
    multiple_of: float | None = None
    min_length: int | None = None
    max_length: int | None = None
    pattern: str | None = None


class PrimitiveDefinition(DefinitionItem):
    """Reusable primitive property definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    type: PrimitiveType
    format: PrimitiveFormat | None = None
    validation: PrimitiveValidationDefinition | None = None
    example: Any | None = None
