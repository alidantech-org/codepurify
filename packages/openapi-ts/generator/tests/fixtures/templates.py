"""Template fixture helpers."""

from __future__ import annotations

from pathlib import Path


def write_debug_templates(root: Path) -> Path:
    """Create a minimal debug template tree with selector paths."""
    template_root = root / "debug"
    (template_root / "(schemas)" / "schemas" / "[name.path]").mkdir(parents=True)
    (template_root / "(resources)" / "res" / "[path]" / "[name.path]").mkdir(parents=True)

    # Write paths.yaml configuration
    (template_root / "paths.yaml").write_text(
        """variables:
  schemas:
    select: schemas.all
    as: schema
    expose:
      name: schema.name
      kind: schema.api.kind

  resources:
    select: resources
    as: resource
    expose:
      name: resource.name
      path: resource.path
      path_name: resource.path_name
""",
        encoding="utf-8",
    )

    (template_root / "summary.txt.j2").write_text(
        "API: {{ api.info.title }}\nLanguage: {{ lang.name }}\n",
        encoding="utf-8",
    )
    (template_root / "(schemas)" / "schemas" / "[name.path]" / "schema.txt.j2").write_text(
        "Schema: {{ name.pascal }}\nKind: {{ kind }}\n",
        encoding="utf-8",
    )
    (template_root / "(resources)" / "res" / "[path]" / "[name.path]" / "resource.txt.j2").write_text(
        "Resource: {{ name.pascal }}\n",
        encoding="utf-8",
    )
    (template_root / ".gitignore").write_text(
        "*.tmp\n",
        encoding="utf-8",
    )

    return template_root
