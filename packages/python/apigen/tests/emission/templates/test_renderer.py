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


def test_dart_version_barrel_exports_match_path_config(project_root: Path) -> None:
    output = render_template(
        template_root=project_root / "templates" / "dart",
        relative_path=Path("{version}") / "v1.dart.j2",
        context={
            "schemas": {
                "emit_models": [
                    {
                        "emit": {"resource_path": ("platform", "auth", "users")},
                        "name": {"path": {"o": "user_public"}},
                    }
                ],
                "emit_dtos": [
                    {
                        "emit": {"resource_path": ("platform", "auth", "users")},
                        "name": {"path": {"o": "create_user_body"}},
                    }
                ],
                "emit_enums": [
                    {
                        "emit": {"resource_path": ("platform", "auth", "users")},
                        "name": {"path": {"o": "user_status"}},
                    }
                ],
            },
            "features": [],
        },
    )

    assert "export 'schemas/platform/auth/users/models/user_public/index.dart';" in output
    assert "export 'schemas/models/platform/auth/users/create_user_body/index.dart';" in output
    assert "export 'schemas/enums/user_status/index.dart';" in output
    assert "schemas/platform/auth/users/enums" not in output
    assert "schemas/platform/auth/users/dtos" not in output
