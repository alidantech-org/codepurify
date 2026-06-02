"""Public loader for compiled Codepot specs."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from utils.loaders.yaml_loader import load_yaml_data


def load_spec(path: Path) -> dict[str, Any]:
    """Load a compiled Codepot spec YAML document as raw data."""

    return load_yaml_data(path)
