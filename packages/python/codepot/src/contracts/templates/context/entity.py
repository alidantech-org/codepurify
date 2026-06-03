"""Entity template context contracts."""

from __future__ import annotations

from dataclasses import dataclass

from contracts.language.context import LanguageField
from contracts.spec.refs import SpecRef
from contracts.templates.context.base import TemplateBaseContext
from contracts.templates.shared.flags import TemplateFieldFlags, TemplateSchemaFlags
from contracts.templates.shared.items import (
    TemplateCollectionContext,
    TemplateFieldContext,
    TemplateItemContext,
    TemplateOwnerContext,
)
from spec.ir.schema.entity.definition import EntityDefinition
from spec.ir.schema.entity.field.definition import EntityFieldDefinition


@dataclass(frozen=True)
class TemplateEntityFieldContext:
    """Template context for one entity field."""

    field: TemplateFieldContext[EntityFieldDefinition]
    source_ref: SpecRef | None = None
    source: object | None = None

    type: str | None = None
    format: str | None = None
    validation: object | None = None

    flags: TemplateFieldFlags = TemplateFieldFlags()
    lang: LanguageField | None = None


@dataclass(frozen=True)
class TemplateEntityContext:
    """Template context for one entity."""

    item: TemplateItemContext[EntityDefinition]
    fields: tuple[TemplateEntityFieldContext, ...]
    flags: TemplateSchemaFlags

    resource: SpecRef | None = None
    tags: tuple[str, ...] = ()
    extends: SpecRef | None = None
    abstract: bool = False


@dataclass(frozen=True)
class TemplateEntitiesEachContext:
    """Context for ``select: entities.each``."""

    base: TemplateBaseContext
    entity: TemplateEntityContext
    item: TemplateEntityContext
    owner: TemplateOwnerContext | None = None


@dataclass(frozen=True)
class TemplateEntitiesAllContext:
    """Context for ``select: entities.all``."""

    base: TemplateBaseContext
    entities: tuple[TemplateEntityContext, ...]
    items: TemplateCollectionContext[TemplateEntityContext]


@dataclass(frozen=True)
class TemplateEntitiesByOwnerContext:
    """Context for ``select: entities.by_owner``."""

    base: TemplateBaseContext
    owner: TemplateOwnerContext
    entities: tuple[TemplateEntityContext, ...]
    items: TemplateCollectionContext[TemplateEntityContext]
