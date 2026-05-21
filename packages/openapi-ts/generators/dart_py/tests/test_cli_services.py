"""Test CLI services."""

from pathlib import Path

from constants.tooling import VSCODE_SETTINGS_TEMPLATE
from cli.services.tooling_plan import ToolingFilePlan, build_tooling_file_plans


def test_tooling_file_plan() -> None:
    """Test ToolingFilePlan dataclass."""
    plan = ToolingFilePlan(
        name="test",
        template_name=VSCODE_SETTINGS_TEMPLATE,
        output_path=Path("output/test.json"),
    )
    assert plan.name == "test"
    assert plan.template_name == VSCODE_SETTINGS_TEMPLATE
    assert plan.output_path == Path("output/test.json")


def test_build_tooling_file_plans() -> None:
    """Test building tooling file plans."""
    dart_package_dir = Path("/test/package")
    plans = build_tooling_file_plans(dart_package_dir)

    assert len(plans) == 2
    assert plans[0].name == "VS Code settings"
    assert plans[1].name == "Analysis options"
    assert ".vscode" in str(plans[0].output_path)
    assert "analysis_options.yaml" in str(plans[1].output_path)
