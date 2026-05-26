"""Safety checks for generated output paths."""

from __future__ import annotations

from pathlib import Path
import re

UNSAFE_CHARS_PATTERN = re.compile(r"[\x00-\x1f<>:\"|?*]")


class UnsafePathError(ValueError):
    """Raised when a generated path is unsafe."""


def validate_path_part(part: str) -> None:
    """Validate one generated path segment."""
    if not part:
        raise UnsafePathError("empty path segment is not allowed")

    if part in {".", ".."}:
        raise UnsafePathError(f"unsafe path segment: {part}")

    if "/" in part or "\\" in part:
        raise UnsafePathError(f"path separator not allowed in segment: {part}")

    if UNSAFE_CHARS_PATTERN.search(part):
        raise UnsafePathError(f"unsafe characters in path segment: {part}")


def validate_relative_path(path: Path) -> None:
    """Validate a final relative output path."""
    if path.is_absolute():
        raise UnsafePathError(f"absolute output path is not allowed: {path}")

    for part in path.parts:
        validate_path_part(part)
