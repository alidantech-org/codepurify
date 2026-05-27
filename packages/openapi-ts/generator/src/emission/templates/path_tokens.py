"""Parser for template path tokens.

Path syntax:
- `(variable)` is a selector segment and is not emitted.
- `[expression]` is a dynamic emitted path value.
- `[[value]]` emits literal `[value]`.
- `((value))` emits literal `(value)`.
"""

from __future__ import annotations

from dataclasses import dataclass
import re

from contracts.paths import PathToken, PathTokenKind

SELECTOR_PATTERN = r"^\((?!\()(.+?)(?<!\))\)$"
DYNAMIC_SEGMENT_PATTERN = r"^\[(?!\[)(.+?)(?<!\])\]$"
ESCAPED_SELECTOR_PATTERN = r"^\(\((.+?)\)\)$"
ESCAPED_DYNAMIC_PATTERN = r"^\[\[(.+?)\]\]$"
INLINE_DYNAMIC_PATTERN = r"\[(?!\[)(.+?)(?<!\])\]"


SELECTOR_REGEX = re.compile(SELECTOR_PATTERN)
DYNAMIC_SEGMENT_REGEX = re.compile(DYNAMIC_SEGMENT_PATTERN)
ESCAPED_SELECTOR_REGEX = re.compile(ESCAPED_SELECTOR_PATTERN)
ESCAPED_DYNAMIC_REGEX = re.compile(ESCAPED_DYNAMIC_PATTERN)
INLINE_DYNAMIC_REGEX = re.compile(INLINE_DYNAMIC_PATTERN)


@dataclass(frozen=True)
class PathSegment:
    """Parsed template path segment."""

    raw: str
    tokens: tuple[PathToken, ...] = ()
    is_selector: bool = False
    is_dynamic: bool = False
    is_static: bool = True


def parse_path_segment(segment: str) -> PathSegment:
    """Parse one template path segment."""
    escaped_selector = ESCAPED_SELECTOR_REGEX.match(segment)
    if escaped_selector:
        return PathSegment(
            raw=segment,
            tokens=(
                PathToken(
                    kind=PathTokenKind.ESCAPED_SELECTOR,
                    raw=segment,
                    expression=escaped_selector.group(1),
                ),
            ),
            is_static=False,
        )

    escaped_dynamic = ESCAPED_DYNAMIC_REGEX.match(segment)
    if escaped_dynamic:
        return PathSegment(
            raw=segment,
            tokens=(
                PathToken(
                    kind=PathTokenKind.ESCAPED_DYNAMIC,
                    raw=segment,
                    expression=escaped_dynamic.group(1),
                ),
            ),
            is_static=False,
        )

    selector = SELECTOR_REGEX.match(segment)
    if selector:
        return PathSegment(
            raw=segment,
            tokens=(
                PathToken(
                    kind=PathTokenKind.SELECTOR,
                    raw=segment,
                    expression=selector.group(1).strip(),
                ),
            ),
            is_selector=True,
            is_static=False,
        )

    dynamic = DYNAMIC_SEGMENT_REGEX.match(segment)
    if dynamic:
        return PathSegment(
            raw=segment,
            tokens=(
                PathToken(
                    kind=PathTokenKind.DYNAMIC,
                    raw=segment,
                    expression=dynamic.group(1).strip(),
                ),
            ),
            is_dynamic=True,
            is_static=False,
        )

    inline_tokens = tuple(
        PathToken(
            kind=PathTokenKind.DYNAMIC,
            raw=match.group(0),
            expression=match.group(1).strip(),
        )
        for match in INLINE_DYNAMIC_REGEX.finditer(segment)
    )

    if inline_tokens:
        return PathSegment(
            raw=segment,
            tokens=inline_tokens,
            is_dynamic=True,
            is_static=False,
        )

    return PathSegment(raw=segment)


def parse_path_segments(parts: tuple[str, ...]) -> tuple[PathSegment, ...]:
    """Parse multiple path parts."""
    return tuple(parse_path_segment(part) for part in parts)


# Backward-compatible wrappers for old emission modules/tests.
# Keep temporarily while descriptor/path_expander are migrated.


def parse_segment_token(segment: str) -> PathToken | None:
    """Parse a full dynamic segment token."""
    parsed = parse_path_segment(segment)

    if parsed.tokens and len(parsed.tokens) == 1:
        token = parsed.tokens[0]
        if token.kind in {
            PathTokenKind.SELECTOR,
            PathTokenKind.DYNAMIC,
            PathTokenKind.ESCAPED_DYNAMIC,
            PathTokenKind.ESCAPED_SELECTOR,
        }:
            return token

    return None


def find_inline_tokens(segment: str) -> list[PathToken]:
    """Find inline dynamic tokens inside a path segment."""
    parsed = parse_path_segment(segment)

    if not parsed.tokens:
        return []

    return [token for token in parsed.tokens if token.kind == PathTokenKind.DYNAMIC and token.raw != segment]
