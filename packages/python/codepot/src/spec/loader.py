"""Public loader for compiled Codepot specs."""

from __future__ import annotations

from pathlib import Path

from spec.ir.shared.document import CodepotDefinition
from utils.loaders.yaml_loader import load_yaml_data


def load_spec(path: Path) -> CodepotDefinition:
    """Load and validate a compiled Codepot spec from YAML."""

    return CodepotDefinition.model_validate(load_yaml_data(path))
