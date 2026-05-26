"""Expand dynamic template paths into output paths."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

from constants.emission import TEMPLATE_EXTENSION
from emission.templates.path_safety import validate_path_part, validate_relative_path
from emission.templates.path_tokens import (
    PathTokenKind,
    find_inline_tokens,
    parse_segment_token,
)
from emission.templates.resolver import resolve_variable, stringify_value


def expand_template_path(template_path: Path, context: Mapping[str, Any]) -> Path:
    """Expand a template-relative path into an output-relative path."""
    output_parts: list[str] = []

    for raw_part in template_path.parts:
        expanded = _expand_part(raw_part, context)
        output_parts.extend(expanded)

    output_path = Path(*output_parts)
    output_path = _strip_template_suffix(output_path)
    validate_relative_path(output_path)
    return output_path


def _expand_part(raw_part: str, context: Mapping[str, Any]) -> list[str]:
    token = parse_segment_token(raw_part)

    if token and token.kind is PathTokenKind.SPREAD:
        value = resolve_variable(context, token.expression)
        return _expand_spread(value, token.expression)

    if token and token.kind is PathTokenKind.SEGMENT:
        value = stringify_value(resolve_variable(context, token.expression))
        validate_path_part(value)
        return [value]

    value = _expand_inline(raw_part, context)
    validate_path_part(value)
    return [value]


def _expand_spread(value: Any, expression: str) -> list[str]:
    if isinstance(value, str) or not isinstance(value, Sequence):
        raise TypeError(f"spread token must resolve to a sequence: {expression}")

    parts = [stringify_value(item) for item in value]
    for part in parts:
        validate_path_part(part)

    return parts


def _expand_inline(raw_part: str, context: Mapping[str, Any]) -> str:
    result = raw_part

    for token in find_inline_tokens(raw_part):
        value = stringify_value(resolve_variable(context, token.expression))
        result = result.replace(token.raw, value)

    return result


def _strip_template_suffix(path: Path) -> Path:
    text = path.as_posix()

    if text.endswith(TEMPLATE_EXTENSION):
        text = text[: -len(TEMPLATE_EXTENSION)]

    return Path(text)
