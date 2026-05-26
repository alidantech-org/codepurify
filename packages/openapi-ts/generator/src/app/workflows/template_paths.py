"""Template path resolution for app workflows."""

from __future__ import annotations

from pathlib import Path

from contracts.language import LanguageAdapter

DEFAULT_TEMPLATES_ROOT = Path("templates")


def resolve_template_root(
    *,
    adapter: LanguageAdapter,
    templates_path: Path | None,
) -> Path:
    """Resolve the template root for a language adapter."""
    if templates_path is not None:
        return templates_path

    return DEFAULT_TEMPLATES_ROOT / adapter.template_name
