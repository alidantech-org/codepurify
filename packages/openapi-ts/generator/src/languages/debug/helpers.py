from __future__ import annotations

from pathlib import Path

from constants.files import (
    TEMPLATE_OPERATION_FILE,
    TEMPLATE_RESOURCE_FILE,
    TEMPLATE_SCHEMA_FILE,
)


def build_resource_file_name(key: str) -> str:
    """Build a resource file name from its key."""
    return TEMPLATE_RESOURCE_FILE.format(key=key)


def build_schema_file_name(name: str) -> str:
    """Build a schema file name from its name."""
    return TEMPLATE_SCHEMA_FILE.format(name=name)


def build_operation_file_name(operation_id: str) -> str:
    """Build an operation file name from its operation_id."""
    return TEMPLATE_OPERATION_FILE.format(operation_id=operation_id)


def build_resource_path(folder: str, key: str) -> Path:
    """Build the full path for a resource file."""
    return Path(folder) / build_resource_file_name(key)


def build_schema_path(folder: str, name: str) -> Path:
    """Build the full path for a schema file."""
    return Path(folder) / build_schema_file_name(name)


def build_operation_path(folder: str, operation_id: str) -> Path:
    """Build the full path for an operation file."""
    return Path(folder) / build_operation_file_name(operation_id)
