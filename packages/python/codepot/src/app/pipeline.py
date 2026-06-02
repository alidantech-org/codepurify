"""Temporary end-to-end pipeline for CLI wiring."""

from __future__ import annotations

from pathlib import Path

from codepot.languages.python.pipeline import PythonLanguagePipeline
from codepot.loader.yaml_loader import load_codepot_yaml
from codepot.planning.pipeline import build_fake_generation_plan
from codepot.repository.document import CodepotRepository


def run_fake_pipeline(input_path: Path) -> str:
    """Run a temporary load/repository/plan/language pipeline."""

    document = load_codepot_yaml(input_path)
    repo = CodepotRepository.from_document(document)
    plan = build_fake_generation_plan(repo)
    language_plan = PythonLanguagePipeline().build(plan)

    return (
        f"Loaded Codepot IR: {document.key} v{document.version}\n"
        f"Enums: {repo.enums.count()}\n"
        f"Models: {repo.models.count()}\n"
        f"DTOs: {repo.dtos.count()}\n"
        f"Resources: {repo.resources.count()}\n"
        f"Language plan: {language_plan.language}\n"
    )
