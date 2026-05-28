"""Tests for Jinja template rendering."""

from __future__ import annotations

from pathlib import Path

from src.emission.templates.renderer import render_template


def test_render_template_uses_contract_context(tmp_path: Path) -> None:
    template_root = tmp_path / "templates"
    template_root.mkdir()
    template = template_root / "hello.txt.j2"
    template.write_text("Hello {{ name }}", encoding="utf-8")

    output = render_template(
        template_root=template_root,
        relative_path=Path("hello.txt.j2"),
        context={"name": "World"},
    )

    assert output == "Hello World"
