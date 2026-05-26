"""Template fixture helpers."""

from __future__ import annotations

from pathlib import Path


def write_debug_templates(root: Path) -> Path:
    """Create a minimal debug template tree."""
    template_root = root / "debug"
    (template_root / "schemas" / "[schema.name.path]").mkdir(parents=True)
    (template_root / "resources" / "[resource.name.path]").mkdir(parents=True)

    (template_root / "summary.txt.j2").write_text(
        "API: {{ api.info.title }}\nLanguage: {{ lang.name }}\n",
        encoding="utf-8",
    )
    (template_root / "schemas" / "[schema.name.path]" / "schema.txt.j2").write_text(
        "Schema: {{ schema.name.pascal }}\nKind: {{ schema.api.kind }}\n",
        encoding="utf-8",
    )
    (template_root / "resources" / "[resource.name.path]" / "resource.txt.j2").write_text(
        "Resource: {{ resource.name.pascal }}\n",
        encoding="utf-8",
    )
    (template_root / ".gitignore").write_text(
        "*.tmp\n",
        encoding="utf-8",
    )

    return template_root
