"""TypeScript field template builders."""

from __future__ import annotations

from contracts.api import ApiField, ApiSchema
from contracts.template import (
    TemplateField,
    TemplateFieldLang,
    TemplateFieldMeta,
    TemplateGroup,
    TemplateItemEmit,
    TemplateItemKey,
)
from languages.typescript.dependencies import field_dependencies
from languages.typescript.names import safe_ts_identifier
from languages.typescript.types import ts_field_type


def _ts_nullable(field: ApiField, schema_by_ref: dict[str, ApiSchema]) -> bool:
    """Return whether the TypeScript field type includes null."""
    if field.nullable:
        return True

    ref_schema = schema_by_ref.get(field.schema_ref or "")
    return bool(ref_schema and ref_schema.nullable)


def _ts_optional(field: ApiField) -> bool:
    """Return whether the TypeScript field should be optional."""
    return not field.required


def template_field(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> TemplateField:
    """Build a TemplateField for TypeScript templates."""
    dependencies = field_dependencies(field, schema_by_ref)

    return TemplateField(
        api=field,
        name=field.name,
        lang=TemplateFieldLang(
            kind="typescript_field",
            type=ts_field_type(field, schema_by_ref),
            display_name=safe_ts_identifier(field.name.camel.original, fallback="field"),
            required=field.required,
            nullable=_ts_nullable(field, schema_by_ref),
            # optional=_ts_optional(field),
            query_enabled=field.query.enabled,
            sortable=field.query.sortable,
            selectable=field.query.selectable,
            filterable=field.query.filterable,
            searchable=field.query.searchable,
            operators=field.query.operators,
        ),
        emit=TemplateItemEmit(
            group=TemplateGroup.FIELDS,
            item_key=TemplateItemKey.FIELD,
            key=field.id,
            ref=field.schema_ref,
            path_parts=(TemplateGroup.FIELDS.value, field.name.path.o),
            dependency_refs=_field_dependency_refs(field),
            dependencies=dependencies,
        ),
        meta=TemplateFieldMeta(
            default=field.default,
            enum_values=field.enum_values,
            raw_type=field.type.raw_type,
        ),
    )


def _field_dependency_refs(field: ApiField) -> tuple[str, ...]:
    refs: list[str] = []

    for ref in (
        field.schema_ref,
        *field.schema_refs,
        field.item_ref,
        *field.item_refs,
    ):
        if ref and ref not in refs:
            refs.append(ref)

    return tuple(refs)
