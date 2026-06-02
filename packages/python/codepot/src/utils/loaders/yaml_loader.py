"""YAML loader for compiled Codepot IR documents."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def load_yaml_data(path: Path) -> dict[str, Any]:
    """Load YAML data from disk."""

    with path.open("r", encoding="utf-8") as file:
        data = yaml.safe_load(file)

    if not isinstance(data, dict):
        raise ValueError("Codepot YAML root must be an object.")

    return data
