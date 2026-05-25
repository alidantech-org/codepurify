from __future__ import annotations

from pathlib import Path

from pydantic import BaseModel, Field

from core.paths import ProjectPaths


class CliOptions(BaseModel):
    debug: bool = False
    verbose: bool = False
    quiet: bool = False
    dry_run: bool = False


class GeneratorConfig(BaseModel):
    project_name: str = "generator"
    default_language: str | None = None
    templates_dir: Path | None = None
    output_dir: Path | None = None
    options: CliOptions = Field(default_factory=CliOptions)


class RuntimeContext(BaseModel):
    paths: ProjectPaths
    config: GeneratorConfig
    options: CliOptions

    model_config = {
        "arbitrary_types_allowed": True,
    }


def create_runtime_context(options: CliOptions) -> RuntimeContext:
    paths = ProjectPaths.from_cwd()
    config = GeneratorConfig(options=options)

    return RuntimeContext(
        paths=paths,
        config=config,
        options=options,
    )
