"""Tests for template scanning."""

from __future__ import annotations

from tests.fixtures.templates import write_debug_templates
from src.emission.templates.scanner import scan_templates


def test_scan_templates_finds_jinja_and_raw_files(tmp_path) -> None:
    template_root = write_debug_templates(tmp_path)

    descriptors = scan_templates(template_root)
    paths = {descriptor.relative_path.as_posix() for descriptor in descriptors}

    assert "summary.txt.j2" in paths
    assert "schemas/[schema.name.path]/schema.txt.j2" in paths
    assert ".gitignore" in paths
