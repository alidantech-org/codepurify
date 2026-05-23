"""Central project path resolution.

This module provides a single source of truth for resolving project-relative paths
like the templates directory. This avoids fragile parent.parent.parent chains.
"""

from pathlib import Path


def find_project_root(start: Path | None = None) -> Path:
    """
    Find the dart_py project root by looking for pyproject.toml and templates/.

    Args:
        start: Starting path to search from. Defaults to this file's location.

    Returns:
        Path to the project root directory.

    Raises:
        RuntimeError: If project root cannot be found.
    """
    current = (start or Path(__file__).resolve()).parent

    for parent in [current, *current.parents]:
        if (parent / "pyproject.toml").exists() and (parent / "templates").is_dir():
            return parent

    raise RuntimeError("Could not find dart_py project root. Expected pyproject.toml and templates/.")


def get_templates_dir() -> Path:
    """
    Get the templates directory path.

    Returns:
        Path to the templates directory.
    """
    return find_project_root() / "templates"


def get_src_dir() -> Path:
    """
    Get the src directory path.

    Returns:
        Path to the src directory.
    """
    return find_project_root() / "src"
