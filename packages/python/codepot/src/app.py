"""Public application API used by CLI and future integrations."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ValidationResult:
    """Result returned by validate command."""

    spec_path: Path
    ok: bool
    checks: tuple[str, ...]
    warnings: tuple[str, ...] = ()
    errors: tuple[str, ...] = ()


@dataclass(frozen=True)
class InspectResult:
    """Result returned by inspect command."""

    spec_path: Path
    summary: dict[str, Any]


@dataclass(frozen=True)
class PlannedFile:
    """One fake planned file."""

    path: Path
    template: str
    kind: str
    source: str


@dataclass(frozen=True)
class InferResult:
    """Result returned by infer command."""

    spec_path: Path
    language: str
    files: tuple[PlannedFile, ...]


@dataclass(frozen=True)
class EmitResult:
    """Result returned by emit command."""

    spec_path: Path
    language: str
    output_path: Path
    dry_run: bool
    created: tuple[Path, ...] = ()
    updated: tuple[Path, ...] = ()
    unchanged: tuple[Path, ...] = ()
    planned: tuple[Path, ...] = ()
    errors: tuple[str, ...] = ()


class GeneratorApp:
    """Fake public app shell for wiring CLI before real pipeline exists."""

    def validate(self, *, spec_path: Path, strict: bool = False) -> ValidationResult:
        checks = (
            "Spec path received",
            "Fake YAML load passed",
            "Fake required sections found",
            "Fake refs resolved",
        )
        return ValidationResult(spec_path=spec_path, ok=True, checks=checks)

    def inspect(self, *, spec_path: Path, what: str = "overview") -> InspectResult:
        return InspectResult(
            spec_path=spec_path,
            summary={
                "what": what,
                "spec": str(spec_path),
                "version": "fake-v1",
                "content_types": 0,
                "properties": 0,
                "schemas": 0,
                "resources": 0,
                "operations": 0,
                "responses": 0,
            },
        )

    def infer(
        self,
        *,
        spec_path: Path,
        language: str,
        templates_path: Path | None = None,
        output_path: Path | None = None,
        only: tuple[str, ...] = (),
        show_context: bool = False,
        show_paths: bool = False,
    ) -> InferResult:
        files = (
            PlannedFile(Path("models/user.py"), "model.py.j2", "models", "fake:user"),
            PlannedFile(Path("dtos/user_dto.py"), "dto.py.j2", "dtos", "fake:user_dto"),
            PlannedFile(Path("__init__.py"), "__init__.py.j2", "once", "fake:init"),
        )
        return InferResult(spec_path=spec_path, language=language, files=files)

    def emit(
        self,
        *,
        spec_path: Path,
        language: str,
        output_path: Path,
        templates_path: Path | None = None,
        only: tuple[str, ...] = (),
        dry_run: bool = False,
        force: bool = False,
    ) -> EmitResult:
        planned = (
            output_path / "models/user.py",
            output_path / "dtos/user_dto.py",
            output_path / "__init__.py",
        )

        if dry_run:
            return EmitResult(
                spec_path=spec_path,
                language=language,
                output_path=output_path,
                dry_run=True,
                planned=planned,
            )

        return EmitResult(
            spec_path=spec_path,
            language=language,
            output_path=output_path,
            dry_run=False,
            created=planned,
        )
