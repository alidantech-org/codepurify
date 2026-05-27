"""Expand dynamic template paths into output paths."""

from __future__ import annotations

from collections.abc import Mapping
from pathlib import Path
from typing import Any

from contracts.paths import PathTokenKind
from emission.templates.path_safety import validate_path_part, validate_relative_path
from emission.templates.path_tokens import parse_path_segment
from emission.templates.resolver import resolve_variable, stringify_value


def expand_template_path(
    template_path: Path,
    context: Mapping[str, Any],
    *,
    template_extension: str = ".j2",
) -> Path:
    """Expand a template-relative output path using a render context.

    Selector segments must already be removed before calling this function.
    """
    output_parts: list[str] = []

    for raw_part in template_path.parts:
        expanded = _expand_part(raw_part, context)
        output_parts.append(expanded)

    output_path = Path(*output_parts)
    output_path = _strip_template_suffix(output_path, template_extension)
    validate_relative_path(output_path)
    return output_path


def _expand_part(raw_part: str, context: Mapping[str, Any]) -> str:
    parsed = parse_path_segment(raw_part)

    if len(parsed.tokens) == 1:
        token = parsed.tokens[0]

        if token.kind == PathTokenKind.SELECTOR:
            raise ValueError(f"selector segment was not removed before path expansion: {raw_part}")

        if token.kind == PathTokenKind.ESCAPED_DYNAMIC:
            value = f"[{token.expression}]"
            validate_path_part(value)
            return value

        if token.kind == PathTokenKind.ESCAPED_SELECTOR:
            value = f"({token.expression})"
            validate_path_part(value)
            return value

        if token.kind == PathTokenKind.DYNAMIC and token.raw == raw_part:
            value = stringify_value(resolve_variable(context, token.expression))
            validate_path_part(value)
            return value

    value = _expand_inline(raw_part, context)
    validate_path_part(value)
    return value


def _expand_inline(raw_part: str, context: Mapping[str, Any]) -> str:
    parsed = parse_path_segment(raw_part)
    result = raw_part

    for token in parsed.tokens:
        if token.kind == PathTokenKind.DYNAMIC:
            value = stringify_value(resolve_variable(context, token.expression))
            result = result.replace(token.raw, value)

        if token.kind == PathTokenKind.ESCAPED_DYNAMIC:
            result = result.replace(token.raw, f"[{token.expression}]")

        if token.kind == PathTokenKind.ESCAPED_SELECTOR:
            result = result.replace(token.raw, f"({token.expression})")

    return result


def _strip_template_suffix(path: Path, template_extension: str) -> Path:
    text = path.as_posix()

    if text.endswith(template_extension):
        text = text[: -len(template_extension)]

    return Path(text)
