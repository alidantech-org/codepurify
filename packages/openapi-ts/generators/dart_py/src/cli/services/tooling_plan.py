"""Tooling file plan service."""

from dataclasses import dataclass
from pathlib import Path

from constants.tooling import (
    ANALYSIS_OPTIONS_FILE,
    ANALYSIS_OPTIONS_TEMPLATE,
    VSCODE_DIR_NAME,
    VSCODE_SETTINGS_FILE,
    VSCODE_SETTINGS_TEMPLATE,
)


@dataclass(frozen=True)
class ToolingFilePlan:
    """Plan for generating a tooling file."""
    name: str
    template_name: str
    output_path: Path


def build_tooling_file_plans(dart_package_dir: Path) -> list[ToolingFilePlan]:
    """Build plans for all tooling files."""
    vscode_dir = dart_package_dir / VSCODE_DIR_NAME
    vscode_settings = vscode_dir / VSCODE_SETTINGS_FILE
    analysis_options = dart_package_dir / ANALYSIS_OPTIONS_FILE

    return [
        ToolingFilePlan(
            name="VS Code settings",
            template_name=VSCODE_SETTINGS_TEMPLATE,
            output_path=vscode_settings,
        ),
        ToolingFilePlan(
            name="Analysis options",
            template_name=ANALYSIS_OPTIONS_TEMPLATE,
            output_path=analysis_options,
        ),
    ]
