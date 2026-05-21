"""Tooling file generation service."""

from pathlib import Path

from constants.messages import MSG_FAILED_TO_GENERATE, MSG_GENERATED, MSG_SKIPPING_EXISTING
from constants.tooling import VSCODE_DIR_NAME
from logger import console

from .template_env import create_template_env, get_tooling_templates_dir
from .tooling_plan import build_tooling_file_plans


def generate_tooling_files(dart_output: Path, force: bool = False) -> None:
    """Generate tooling files (.vscode/settings.json, analysis_options.yaml)."""
    dart_package_dir = dart_output.parent.parent
    templates_dir = get_tooling_templates_dir()

    env = create_template_env(templates_dir)
    if not env:
        return

    plans = build_tooling_file_plans(dart_package_dir)

    for plan in plans:
        if not plan.output_path.exists() or force:
            # Create parent directories if needed
            if VSCODE_DIR_NAME in str(plan.output_path):
                plan.output_path.parent.mkdir(parents=True, exist_ok=True)

            try:
                template = env.get_template(plan.template_name)
                content = template.render()
                plan.output_path.write_text(content, encoding="utf-8")
                console.print(MSG_GENERATED.format(path=plan.output_path))
            except Exception as e:
                console.print(MSG_FAILED_TO_GENERATE.format(name=plan.name, error=e))
        else:
            console.print(MSG_SKIPPING_EXISTING.format(path=plan.output_path))
