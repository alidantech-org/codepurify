"""Template environment service."""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from constants.paths import TEMPLATES_DIR_NAME, TOOLING_TEMPLATE_DIR_NAME
from core.paths import PACKAGE_ROOT, require_existing_dir
from logger import console


def create_template_env(templates_dir: Path) -> Environment | None:
    """Create a Jinja2 environment from a template directory."""
    if not templates_dir.exists():
        console.print("[yellow]Tooling templates not found. Skipping.[/yellow]")
        return None

    return Environment(
        loader=FileSystemLoader(templates_dir),
        trim_blocks=True,
        lstrip_blocks=True,
    )


def get_tooling_templates_dir() -> Path:
    """Get the tooling templates directory."""
    tooling_dir = PACKAGE_ROOT / TEMPLATES_DIR_NAME / TOOLING_TEMPLATE_DIR_NAME
    return require_existing_dir(tooling_dir, "Tooling templates directory")
