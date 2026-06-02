"""Load paths.yaml configuration files."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from contracts.paths import PathBranchKind, PathConfig, PathGroupConfig, PathSelectKind
from utils.loaders.yaml_loader import load_yaml_data


def load_path_config(path: Path) -> PathConfig:
    """Load path planning group configuration."""

    data = load_yaml_data(path)
    groups = data.get("groups") or ()
    if not isinstance(groups, list):
        raise ValueError("Expected 'groups' to be a list.")

    return PathConfig(
        version=int(data["version"]),
        groups=tuple(_load_group(item) for item in groups),
    )


def _load_group(item: Any) -> PathGroupConfig:
    if not isinstance(item, dict):
        raise ValueError("Path group entries must be mappings.")

    template = item.get("template")
    copy = item.get("copy")
    if not template and not copy:
        raise ValueError(f"Path group '{item.get('id')}' must define template or copy.")

    return PathGroupConfig(
        id=str(item["id"]),
        select=PathSelectKind(str(item["select"])),
        branch=PathBranchKind(str(item["branch"])),
        template=None if template is None else str(template),
        copy=None if copy is None else str(copy),
        output=str(item["output"]),
        kind=None if item.get("kind") is None else str(item["kind"]),
        enabled=bool(item.get("enabled", True)),
        description=None if item.get("description") is None else str(item["description"]),
    )
