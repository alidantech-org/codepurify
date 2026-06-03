"""Python adapter utility helpers."""

from __future__ import annotations

import posixpath
from pathlib import Path
from typing import Any

from languages.python.constants import PYTHON_SOURCE_EXTENSIONS


def enum_or_value(value: Any) -> str | None:
    """Return enum/string value when possible."""

    if value is None:
        return None

    raw = getattr(value, "value", value)
    if isinstance(raw, str):
        return raw

    return None


def remove_known_extension(path: str) -> str:
    """Remove a known Python source extension."""

    for suffix in PYTHON_SOURCE_EXTENSIONS:
        if path.endswith(suffix):
            return path[: -len(suffix)]

    return path


def relative_module_path(
    source_path: Path,
    target_path: Path,
    *,
    include_extension: bool,
) -> str:
    """Create normalized Python relative module path text."""

    source_dir = source_path.parent.as_posix()
    target = target_path.as_posix()
    module = posixpath.relpath(target, source_dir)

    if not include_extension:
        module = remove_known_extension(module)

    return module


def dotted_module_path(path: str) -> str:
    """Convert a path-like module into a Python dotted module."""

    path = remove_known_extension(path.strip("/"))
    return ".".join(part for part in path.split("/") if part)


def safe_getattr(source: object, key: str, fallback: Any = None) -> Any:
    """Read an attribute from object-like config safely."""

    return getattr(source, key, fallback)


def get_case_value(name: object, case_name: str, fallback: str = "") -> str:
    """Get a named casing value from a name-like object."""

    value = getattr(name, case_name, None)
    if isinstance(value, str):
        return value

    clean = getattr(name, "clean", None)
    if isinstance(clean, str):
        return clean

    raw = getattr(name, "raw", None)
    if isinstance(raw, str):
        return raw

    return fallback
