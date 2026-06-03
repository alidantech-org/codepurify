"""Python syntax builders.

This module is the single place where Python syntax strings are created.
Other Python adapter modules should call these helpers instead of manually
building syntax with inline f-strings.
"""

from __future__ import annotations

from pathlib import Path

from languages.python.constants import PY_NONE
from languages.python.utils import (
    dotted_module_path,
    relative_module_path,
    remove_known_extension,
)


def alias(left: str, right: str | None) -> str:
    """Create Python alias syntax."""

    if not right:
        return left

    return f"{left} as {right}"


def nullable(annotation: str) -> str:
    """Create a Python nullable annotation."""

    return union((annotation, PY_NONE))


def array(annotation: str) -> str:
    """Create a Python list annotation."""

    return f"list[{annotation}]"


def union(values: tuple[str, ...] | list[str]) -> str:
    """Create a Python union annotation."""

    unique: list[str] = []
    for value in values:
        if value not in unique:
            unique.append(value)

    return " | ".join(unique)


def import_line(*, module: str, symbols: tuple[str, ...]) -> str:
    """Create a Python from-import line."""

    return f"from {module} import {', '.join(symbols)}"


def import_module_line(*, module: str, alias_name: str | None = None) -> str:
    """Create a Python module import line."""

    if alias_name:
        return f"import {module} as {alias_name}"

    return f"import {module}"


def export_all_assignment(symbols: tuple[str, ...]) -> str:
    """Create a Python __all__ assignment."""

    items = ", ".join(repr(symbol) for symbol in symbols)
    return f"__all__ = ({items},)"


def join_path_tokens(tokens: tuple[str, ...] | list[str]) -> str:
    """Join module/path tokens using Python package separator."""

    cleaned = [token.strip("/.") for token in tokens if token]
    return ".".join(cleaned)


def strip_root_prefix(path: str, root: str | None) -> str:
    """Strip a configured source root prefix from a module path."""

    if not root:
        return path

    normalized_root = root.strip("/")
    if not normalized_root:
        return path

    if path == normalized_root:
        return ""

    prefix = f"{normalized_root}/"
    if path.startswith(prefix):
        return path[len(prefix) :]

    return path


def maybe_without_extension(path: str, *, include_extension: bool) -> str:
    """Remove known source extension when import config excludes extensions."""

    if include_extension:
        return path

    return remove_known_extension(path)


def alias_module_path(
    *,
    alias_name: str,
    target_path: Path,
    root: str | None,
    include_extension: bool,
) -> str:
    """Create an alias/root-based Python module path."""

    target = strip_root_prefix(target_path.as_posix(), root)
    target = maybe_without_extension(target, include_extension=include_extension)
    return join_path_tokens((alias_name, dotted_module_path(target)))


def package_module_path(
    *,
    package: str,
    target_path: Path,
    include_extension: bool,
) -> str:
    """Create a package-based Python module path."""

    target = maybe_without_extension(
        target_path.as_posix(), include_extension=include_extension
    )
    return join_path_tokens((package, dotted_module_path(target)))


def relative_import_module_path(
    *,
    source_path: Path,
    target_path: Path,
    include_extension: bool,
) -> str:
    """Create a Python relative module path.

    This currently returns a dotted-ish relative module approximation. The
    pipeline can improve package root information later.
    """

    module = relative_module_path(
        source_path,
        target_path,
        include_extension=include_extension,
    )

    module = dotted_module_path(module)
    if module.startswith(".."):
        return module

    if module.startswith("."):
        return module

    return f".{module}"
