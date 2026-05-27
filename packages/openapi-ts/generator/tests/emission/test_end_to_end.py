"""End-to-end emission test with debug templates."""

from __future__ import annotations

from pathlib import Path

from src.app.app import GeneratorApp
from tests.fixtures.templates import write_debug_templates


def test_debug_emit_end_to_end(tmp_path) -> None:
    """Test full emission pipeline with debug language and templates."""
    # Setup debug templates
    template_root = write_debug_templates(tmp_path / "templates")
    input_path = _write_resource_path_openapi(tmp_path / "openapi.yaml")
    output_path = tmp_path / "output"

    # Run emission
    app = GeneratorApp()
    result = app.emit(
        input_path=input_path,
        language="debug",
        output_path=output_path,
        templates_path=template_root,
        dry_run=False,
    )

    # Verify results
    assert result.language == "debug"
    assert result.dry_run is False
    assert len(result.planned) > 0
    assert len(result.written) > 0

    # Verify output files exist
    for written_path in result.written:
        assert written_path.exists()
        assert written_path.is_relative_to(output_path)

    # Verify summary.txt was rendered
    summary_path = output_path / "summary.txt"
    assert summary_path.exists()
    summary_content = summary_path.read_text(encoding="utf-8")
    assert "API:" in summary_content
    assert "Language: debug" in summary_content
    assert (output_path / "res" / "platform" / "auth" / "users" / "resource.txt").exists()
    assert (output_path / "res" / "shared" / "resource.txt").exists()


def test_debug_emit_dry_run(tmp_path, sample_openapi_path) -> None:
    """Test dry-run mode with debug templates."""
    template_root = write_debug_templates(tmp_path / "templates")
    output_path = tmp_path / "output"

    app = GeneratorApp()
    result = app.emit(
        input_path=sample_openapi_path,
        language="debug",
        output_path=output_path,
        templates_path=template_root,
        dry_run=True,
    )

    # Verify dry-run behavior
    assert result.dry_run is True
    assert len(result.planned) > 0
    assert len(result.written) == 0
    assert len(result.skipped) > 0

    # Verify no files were actually written
    assert not output_path.exists()


def _write_resource_path_openapi(path: Path) -> Path:
    path.write_text(
        """openapi: 3.1.0
info:
  title: Resource Path API
  version: v1
paths:
  /users:
    x-codegen:
      resource:
        name: users
        path:
          - platform
          - auth
    get:
      operationId: listUsers
      responses:
        "200":
          description: OK
  /shared:
    x-codegen:
      resource:
        name: shared
    get:
      operationId: getShared
      responses:
        "200":
          description: OK
""",
        encoding="utf-8",
    )
    return path
