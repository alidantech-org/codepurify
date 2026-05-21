"""Computed project paths."""

from pathlib import Path

from constants.paths import (
    DART_TEMPLATE_DIR_NAME,
    DOCS_TEMPLATE_DIR_NAME,
    PYPROJECT_FILE_NAME,
    TEMPLATES_DIR_NAME,
    TOOLING_TEMPLATE_DIR_NAME,
)

# Resolve paths relative to this file
SRC_DIR = Path(__file__).resolve().parents[1]
PACKAGE_ROOT = SRC_DIR.parent

# Computed template directories
TEMPLATES_DIR = PACKAGE_ROOT / TEMPLATES_DIR_NAME
DART_TEMPLATES_DIR = TEMPLATES_DIR / DART_TEMPLATE_DIR_NAME
DOCS_TEMPLATES_DIR = TEMPLATES_DIR / DOCS_TEMPLATE_DIR_NAME
TOOLING_TEMPLATES_DIR = TEMPLATES_DIR / TOOLING_TEMPLATE_DIR_NAME

# Project files
PYPROJECT_FILE = PACKAGE_ROOT / PYPROJECT_FILE_NAME


def require_existing_dir(path: Path, label: str) -> Path:
    """Validate that a directory exists, raising a clear error if not."""
    if not path.exists() or not path.is_dir():
        raise FileNotFoundError(f"{label} not found: {path}")
    return path
