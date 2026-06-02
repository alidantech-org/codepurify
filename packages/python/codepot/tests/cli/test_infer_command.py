from typer.testing import CliRunner

from cli.main import app

runner = CliRunner()


def test_infer_lists_planned_files() -> None:
    result = runner.invoke(app, ["infer"])

    assert result.exit_code == 0
    assert "Inferred 3 files (python)" in result.output
    assert "models/user.py" in result.output
    assert "dtos/user_dto.py" in result.output
    assert "__init__.py" in result.output
    assert "No files written. Run emit to generate." in result.output


def test_infer_show_paths_outputs_paths_only() -> None:
    result = runner.invoke(app, ["infer", "--show-paths"])

    assert result.exit_code == 0
    assert result.output.splitlines() == [
        "models/user.py",
        "dtos/user_dto.py",
        "__init__.py",
    ]
