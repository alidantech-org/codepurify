"""Template tree scanner."""

from __future__ import annotations

from pathlib import Path

from emission.templates.descriptor import TemplateDescriptor, describe_template


def scan_templates(template_root: Path) -> list[TemplateDescriptor]:
    """Scan a template folder and return descriptors for all files."""
    root = template_root.resolve()

    if not root.exists():
        raise FileNotFoundError(root)

    if not root.is_dir():
        raise NotADirectoryError(root)

    descriptors = [describe_template(root, path) for path in root.rglob("*") if path.is_file()]

    return sorted(descriptors, key=lambda item: item.relative_path.as_posix())
