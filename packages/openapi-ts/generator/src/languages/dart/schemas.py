"""Dart schema template builders."""

from __future__ import annotations

from contracts.api import ApiContract, ApiSchema
from contracts.template import (
    TemplateDocs,
    TemplateEnumValue,
    TemplateGroup,
    TemplateItemEmit,
    TemplateItemKey,
    TemplateSchema,
    TemplateSchemaGroups,
    TemplateSchemaLang,
    TemplateSchemaMeta,
)
from languages.dart.dependencies import schema_dependencies
from languages.dart.fields import template_field
from languages.dart.names import DART_RESERVED_WORDS, safe_enum_key
from languages.dart.paths import resource_path_for_schema, safe_schema_file_name


def template_schema_groups(
    api: ApiContract,
    *,
    resource_paths: dict[str, tuple[str, ...]],
) -> TemplateSchemaGroups:
    """Build Dart schema groups."""
    schema_by_ref = {schema.ref: schema for schema in api.schemas.all}

    return TemplateSchemaGroups(
        all=tuple(_schema(schema, TemplateGroup.SCHEMAS, schema_by_ref, resource_paths) for schema in api.schemas.all),
        models=tuple(_schema(schema, TemplateGroup.MODELS, schema_by_ref, resource_paths) for schema in api.schemas.models),
        dtos=tuple(_schema(schema, TemplateGroup.DTOS, schema_by_ref, resource_paths) for schema in api.schemas.dtos),
        enums=tuple(_schema(schema, TemplateGroup.ENUMS, schema_by_ref, resource_paths) for schema in api.schemas.enums),
        primitives=tuple(_schema(schema, TemplateGroup.PRIMITIVES, schema_by_ref, resource_paths) for schema in api.schemas.primitives),
        aliases=tuple(_schema(schema, TemplateGroup.ALIASES, schema_by_ref, resource_paths) for schema in api.schemas.aliases),
        unknown=tuple(_schema(schema, TemplateGroup.UNKNOWN, schema_by_ref, resource_paths) for schema in api.schemas.unknown),
        queries=tuple(_schema(schema, TemplateGroup.QUERIES, schema_by_ref, resource_paths) for schema in api.schemas.queries),
        params=tuple(_schema(schema, TemplateGroup.PARAMS, schema_by_ref, resource_paths) for schema in api.schemas.params),
        bodies=tuple(_schema(schema, TemplateGroup.BODIES, schema_by_ref, resource_paths) for schema in api.schemas.bodies),
        responses=tuple(_schema(schema, TemplateGroup.RESPONSES, schema_by_ref, resource_paths) for schema in api.schemas.responses),
        emit_models=tuple(_schema(schema, TemplateGroup.MODELS, schema_by_ref, resource_paths) for schema in api.schemas.emit_models),
        emit_dtos=tuple(_schema(schema, TemplateGroup.DTOS, schema_by_ref, resource_paths) for schema in api.schemas.emit_dtos),
        emit_enums=tuple(_schema(schema, TemplateGroup.ENUMS, schema_by_ref, resource_paths) for schema in api.schemas.emit_enums),
    )


def _schema(
    schema: ApiSchema,
    group: TemplateGroup,
    schema_by_ref: dict[str, ApiSchema],
    resource_paths: dict[str, tuple[str, ...]],
) -> TemplateSchema:
    fields = tuple(template_field(field, schema_by_ref) for field in schema.fields)
    dependencies = schema_dependencies(schema, schema_by_ref)
    resource_path = resource_path_for_schema(schema, resource_paths)
    file_name = safe_schema_file_name(schema)
    folder_path = _folder_path(schema=schema, group=group, resource_path=resource_path)

    return TemplateSchema(
        api=schema,
        name=schema.name,
        fields=fields,
        lang=TemplateSchemaLang(
            kind=f"dart_{_schema_kind(schema)}",
            type=_schema_kind(schema),
            display_name=schema.name.pascal,
            symbol_name=schema.name.pascal,
            field_count=len(fields),
            dependency_count=len(dependencies),
            query_enabled=schema.query.enabled,
        ),
        emit=TemplateItemEmit(
            group=group,
            item_key=_item_key(group),
            key=schema.ref,
            ref=schema.ref,
            path_parts=(group.value, schema.name.path),
            path=folder_path,
            resource_path=resource_path,
            folder_path=folder_path,
            file_name=file_name,
            relative_doc_path=folder_path,
            dependency_refs=schema.dependencies,
            dependencies=dependencies,
            imports=tuple(dependency for dependency in dependencies if dependency.is_importable),
        ),
        docs=TemplateDocs(description=schema.description),
        meta=TemplateSchemaMeta(
            is_alias=schema.is_alias,
            alias_of=schema.alias_of,
            primitive_type=schema.primitive_type,
            primitive_format=schema.primitive_format,
            enum_type=schema.enum_type,
            enum_values=tuple(
                TemplateEnumValue(
                    wire=value.value,
                    name=value.name.camel,
                    safe_name=safe_enum_key(value.value, reserved_words=DART_RESERVED_WORDS),
                    original_name=value.value,
                )
                for value in schema.enum_values
            ),
            enum_count=len(schema.enum_values),
            composition_refs=schema.composition_refs,
            inherited_refs=schema.inherited_refs,
            query_enabled=schema.query.enabled,
        ),
    )


def _folder_path(
    *,
    schema: ApiSchema,
    group: TemplateGroup,
    resource_path: tuple[str, ...],
) -> tuple[str, ...]:
    if group == TemplateGroup.ENUMS:
        return (schema.name.path,)

    if group == TemplateGroup.DTOS:
        role = _dto_role(schema)
        operation = _dto_operation(schema)
        return (operation, role)

    return (schema.name.path,)


def _dto_role(schema: ApiSchema) -> str:
    role = schema.meta.get("role") or schema.meta.get("dto_role")
    if isinstance(role, str) and role:
        return role

    roles = schema.meta.get("roles")
    if isinstance(roles, (list, tuple)) and roles and isinstance(roles[0], str):
        return roles[0]

    return "model"


def _dto_operation(schema: ApiSchema) -> str:
    operation = schema.meta.get("operation") or schema.meta.get("operation_name")
    if isinstance(operation, str) and operation:
        return operation

    return schema.name.path


def _schema_kind(schema: ApiSchema) -> str:
    return schema.kind.value if hasattr(schema.kind, "value") else str(schema.kind)


def _item_key(group: TemplateGroup) -> TemplateItemKey:
    if group == TemplateGroup.MODELS:
        return TemplateItemKey.MODEL

    if group == TemplateGroup.DTOS:
        return TemplateItemKey.DTO

    if group == TemplateGroup.ENUMS:
        return TemplateItemKey.ENUM

    if group == TemplateGroup.PRIMITIVES:
        return TemplateItemKey.PRIMITIVE

    return TemplateItemKey.SCHEMA
