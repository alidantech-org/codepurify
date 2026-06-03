"""TypeScript type helpers."""

from __future__ import annotations

from contracts.language.types import LanguageType, LanguageTypeKind
from languages.typescript.constants import (
    PRIMITIVE_BOOLEAN,
    PRIMITIVE_INTEGER,
    PRIMITIVE_NUMBER,
    PRIMITIVE_STRING,
    TS_BOOLEAN,
    TS_NUMBER,
    TS_STRING,
    TS_UNKNOWN,
    TS_VOID,
)
from languages.typescript.syntax import array as ts_array
from languages.typescript.syntax import nullable as ts_nullable
from languages.typescript.utils import enum_or_value


def _primitive_annotation(source: object) -> str:
    """Map primitive-like source to TypeScript annotation."""

    source_type = enum_or_value(getattr(source, "type", None))

    if source_type == PRIMITIVE_STRING:
        return TS_STRING
    if source_type in {PRIMITIVE_NUMBER, PRIMITIVE_INTEGER}:
        return TS_NUMBER
    if source_type == PRIMITIVE_BOOLEAN:
        return TS_BOOLEAN

    return TS_UNKNOWN


def make_typescript_type(
    source: object,
    *,
    is_array: bool = False,
    is_nullable: bool = False,
    is_dynamic: bool = False,
    is_void: bool = False,
) -> LanguageType:
    """Create a TypeScript type annotation."""

    if is_void:
        return LanguageType(
            kind=LanguageTypeKind.VOID,
            annotation=TS_VOID,
            display=TS_VOID,
            is_void=True,
        )

    if is_dynamic:
        base = LanguageType(
            kind=LanguageTypeKind.DYNAMIC,
            annotation=TS_UNKNOWN,
            display=TS_UNKNOWN,
            is_dynamic=True,
        )
    else:
        annotation = getattr(source, "annotation", None)
        if not isinstance(annotation, str):
            annotation = getattr(source, "name", None)
            annotation = getattr(annotation, "pascal", None) or _primitive_annotation(
                source
            )

        base = LanguageType(
            kind=LanguageTypeKind.PRIMITIVE,
            annotation=annotation,
            display=annotation,
        )

    current = base

    if is_array:
        current = LanguageType(
            kind=LanguageTypeKind.ARRAY,
            annotation=ts_array(current.annotation),
            display=ts_array(current.display),
            is_array=True,
            item=current,
        )

    if is_nullable:
        current = LanguageType(
            kind=LanguageTypeKind.NULLABLE,
            annotation=ts_nullable(current.annotation),
            display=ts_nullable(current.display),
            is_nullable=True,
            item=current,
        )

    return current
