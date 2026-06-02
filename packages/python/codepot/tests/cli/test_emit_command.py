from typer.testing import CliRunner

from cli.main import app

runner = CliRunner()


def test_emit_dry_run_lists_planned_files() -> None:
    result = runner.invoke(app, ["emit", "--dry-run"])

    assert result.exit_code == 0
    assert "Dry run python -> generated" in result.output
    assert "planned" in result.output
    assert "generated/models/user.py" in result.output
    assert "generated/dtos/user_dto.py" in result.output
    assert "generated/__init__.py" in result.output
    assert "3 files processed" in result.output


def test_emit_watch_fails_as_config_error() -> None:
    result = runner.invoke(app, ["emit", "--watch"])

    assert result.exit_code == 3
    assert "--watch is not implemented yet." in result.output
