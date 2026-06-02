from pathlib import Path

from typer.testing import CliRunner

from cli.main import app

runner = CliRunner()


def test_emit_interactive_short_option(monkeypatch) -> None:
    monkeypatch.setattr("cli.options.ask_spec_path", lambda default: Path("codepot.v1.yaml"))
    monkeypatch.setattr("cli.options.ask_language", lambda default: "python")
    monkeypatch.setattr("cli.options.ask_templates_path", lambda language: Path("templates/python"))
    monkeypatch.setattr("cli.options.ask_output_path", lambda default: Path("generated"))
    monkeypatch.setattr("cli.options.ask_only_groups", lambda: ())
    monkeypatch.setattr("cli.options.ask_dry_run", lambda default: True)
    monkeypatch.setattr("cli.options.ask_force", lambda default: default)

    result = runner.invoke(app, ["emit", "-I"])

    assert result.exit_code == 0
    assert "No such option" not in result.output
    assert "Dry run python -> generated" in result.output
