"""Parser for dynamic template path tokens."""

from __future__ import annotations

from constants.emission import (
    INLINE_PATTERN,
    SEGMENT_PATTERN,
    SPREAD_PATTERN,
)
from dataclasses import dataclass
from enum import Enum
import re


class PathTokenKind(str, Enum):
    """Supported dynamic path token kinds."""

    SEGMENT = "segment"
    SPREAD = "spread"
    INLINE = "inline"


@dataclass(frozen=True)
class PathToken:
    """A parsed dynamic path token."""

    kind: PathTokenKind
    expression: str
    raw: str


SEGMENT_REGEX = re.compile(SEGMENT_PATTERN)
SPREAD_REGEX = re.compile(SPREAD_PATTERN)
INLINE_REGEX = re.compile(INLINE_PATTERN)


def parse_segment_token(segment: str) -> PathToken | None:
    """Parse a full path segment token."""
    spread_match = SPREAD_REGEX.match(segment)
    if spread_match:
        return PathToken(PathTokenKind.SPREAD, spread_match.group(1), segment)

    segment_match = SEGMENT_REGEX.match(segment)
    if segment_match:
        return PathToken(PathTokenKind.SEGMENT, segment_match.group(1), segment)

    return None


def find_inline_tokens(segment: str) -> list[PathToken]:
    """Find inline tokens inside a path segment."""
    return [PathToken(PathTokenKind.INLINE, match.group(1), match.group(0)) for match in INLINE_REGEX.finditer(segment)]
