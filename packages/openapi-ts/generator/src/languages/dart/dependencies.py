"""Dart dependency fact builders."""

from __future__ import annotations

from contracts.api import ApiField, ApiSchema
from contracts.template import (
    TemplateDependency,
    TemplateDependencyPurpose,
    TemplateDependencyTarget,
    TemplateDependencyTargetKind,
)


def schema_dependencies(
    schema: ApiSchema,
    schema_by_ref: dict[str, ApiSchema],
) -> tuple[TemplateDependency, ...]:
    """Build schema dependencies for Dart emission."""
    dependencies: list[TemplateDependency] = []

    for ref in schema.inherited_refs:
        dependencies.append(
            dependency(
                ref=ref,
                purpose=TemplateDependencyPurpose.INHERITANCE,
                reason=f"{schema.name.pascal} inherits from {ref}",
                schema_by_ref=schema_by_ref,
                owner_ref=schema.ref,
                is_inheritance=True,
            )
        )

    for ref in schema.dependencies:
        if ref in schema.inherited_refs:
            continue

        dependencies.append(
            dependency(
                ref=ref,
                purpose=TemplateDependencyPurpose.FIELD_TYPE,
                reason=f"{schema.name.pascal} references {ref}",
                schema_by_ref=schema_by_ref,
                owner_ref=schema.ref,
            )
        )

    return tuple(dependencies)


def field_dependencies(
    field: ApiField,
    schema_by_ref: dict[str, ApiSchema],
) -> tuple[TemplateDependency, ...]:
    """Build field dependencies for Dart emission."""
    dependencies: list[TemplateDependency] = []

    for ref in field.schema_refs:
        dependencies.append(
            dependency(
                ref=ref,
                purpose=TemplateDependencyPurpose.FIELD_TYPE,
                reason=f"Field {field.name.camel} uses schema ref {ref}",
                schema_by_ref=schema_by_ref,
            )
        )

    for ref in field.item_refs:
        dependencies.append(
            dependency(
                ref=ref,
                purpose=TemplateDependencyPurpose.ARRAY_ITEM,
                reason=f"Field {field.name.camel} uses array item ref {ref}",
                schema_by_ref=schema_by_ref,
            )
        )

    return tuple(dependencies)


def dependency(
    *,
    ref: str,
    purpose: TemplateDependencyPurpose,
    reason: str,
    schema_by_ref: dict[str, ApiSchema],
    owner_ref: str | None = None,
    is_inheritance: bool = False,
) -> TemplateDependency:
    """Build a typed dependency."""
    target_schema = schema_by_ref.get(ref)
    target = _target(ref, target_schema)
    is_self = owner_ref == ref

    return TemplateDependency(
        ref=ref,
        purpose=purpose,
        reason=reason,
        target=target,
        is_inheritance=is_inheritance,
        is_self=is_self,
        is_importable=not is_self and not target.is_primitive and target.kind != TemplateDependencyTargetKind.UNKNOWN,
    )


def _target(ref: str, schema: ApiSchema | None) -> TemplateDependencyTarget:
    if schema is None:
        return TemplateDependencyTarget(ref=ref)

    kind = _target_kind(schema)

    return TemplateDependencyTarget(
        ref=ref,
        name=schema.name,
        kind=kind,
        schema=schema,
        is_primitive=kind == TemplateDependencyTargetKind.PRIMITIVE,
        is_enum=kind == TemplateDependencyTargetKind.ENUM,
        is_model=kind == TemplateDependencyTargetKind.MODEL,
        is_dto=kind == TemplateDependencyTargetKind.DTO,
    )


def _target_kind(schema: ApiSchema) -> TemplateDependencyTargetKind:
    kind = schema.kind.value if hasattr(schema.kind, "value") else str(schema.kind)

    if kind == "primitive":
        return TemplateDependencyTargetKind.PRIMITIVE

    if kind == "enum":
        return TemplateDependencyTargetKind.ENUM

    if kind == "model":
        return TemplateDependencyTargetKind.MODEL

    if kind == "dto":
        return TemplateDependencyTargetKind.DTO

    return TemplateDependencyTargetKind.UNKNOWN
