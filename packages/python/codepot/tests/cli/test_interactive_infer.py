from pathlib import Path

from typer.testing import CliRunner

from cli.main import app

runner = CliRunner()


def test_infer_interactive_short_option(monkeypatch) -> None:
    monkeypatch.setattr("cli.options.ask_spec_path", lambda default: Path("codepot.v1.yaml"))
    monkeypatch.setattr("cli.options.ask_language", lambda default: "python")
    monkeypatch.setattr("cli.options.ask_templates_path", lambda language: Path("templates/python"))
    monkeypatch.setattr("cli.options.ask_output_path", lambda default: Path("generated"))
    monkeypatch.setattr("cli.options.ask_only_groups", lambda: ())

    result = runner.invoke(app, ["infer", "-I"])

    assert result.exit_code == 0
    assert "No such option" not in result.output
    assert "Inferred 3 files (python)" in result.output
