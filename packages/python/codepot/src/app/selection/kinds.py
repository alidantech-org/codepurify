"""Predetermined selectable Codepot generation kinds."""

from __future__ import annotations

from enum import StrEnum


class SelectionKind(StrEnum):
    """Allowed selection kinds in config."""

    ONCE = "once"
    CONTENT_TYPES = "content_types"
    PRIMITIVES = "primitives"
    ENUMS = "enums"
    COMPOSITES = "composites"
    ENTITIES = "entities"
    MODELS = "models"
    DTOS = "dtos"
    PARAMS = "params"
    RESOURCES = "resources"
    OPERATIONS = "operations"
    ROUTES = "routes"
    ERRORS = "errors"
