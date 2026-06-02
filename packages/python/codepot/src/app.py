"""Public application API used by the CLI and future integrations."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AppModel(BaseModel):
    """Base model configured for CLI-friendly serialization."""

    model_config = ConfigDict(frozen=True)


class BaseRequest(AppModel):
    """Shared request fields accepted by the fake app shell."""

    spec_path: Path
    language: str | None = None
    templates_path: Path | None = None
    output_path: Path | None = None
    only: tuple[str, ...] = ()
    strict: bool = False
    dry_run: bool = False
    force: bool = False
    show_context: bool = False
    show_paths: bool = False
    verbose: bool = False


class ValidateRequest(BaseRequest):
    """Request to validate a Codepot spec."""


class InspectRequest(BaseRequest):
    """Request to inspect a Codepot spec."""

    mode: str = "overview"


class InferRequest(BaseRequest):
    """Request to infer generated files."""

    language: str = "python"
    output_path: Path = Path("generated")


class EmitRequest(BaseRequest):
    """Request to emit generated files."""

    language: str = "python"
    output_path: Path = Path("generated")


class CheckResult(AppModel):
    name: str
    ok: bool = True
    detail: str | None = None


class IssueResult(AppModel):
    severity: str
    message: str
    path: str | None = None
    hint: str | None = None


class InspectSummary(AppModel):
    version: str = "fake-v1"
    schemas: int = 0
    resources: int = 0
    properties: int = 0
    responses: int = 0
    operations: int = 0
    content_types: int = 0


class PlannedFileResult(AppModel):
    path: Path
    template: str
    group: str
    source: str
    context: dict[str, Any] = Field(default_factory=dict)


class WriteFileResult(AppModel):
    path: Path
    status: str
    reason: str | None = None


class ValidateResult(AppModel):
    spec_path: Path
    ok: bool
    checks: tuple[CheckResult, ...]
    warnings: tuple[IssueResult, ...] = ()
    errors: tuple[IssueResult, ...] = ()


class InspectResult(AppModel):
    spec_path: Path
    mode: str
    summary: InspectSummary
    rows: tuple[dict[str, Any], ...] = ()


class InferResult(AppModel):
    spec_path: Path
    language: str
    output_path: Path
    files: tuple[PlannedFileResult, ...]
    show_context: bool = False
    show_paths: bool = False


class EmitResult(AppModel):
    spec_path: Path
    language: str
    output_path: Path
    dry_run: bool
    files: tuple[WriteFileResult, ...]
    errors: tuple[IssueResult, ...] = ()


class GeneratorApp:
    """Fake public app shell for wiring the CLI before the real pipeline is connected."""

    def validate(self, request: ValidateRequest) -> ValidateResult:
        checks = (
            CheckResult(name="Spec path received", detail=str(request.spec_path)),
            CheckResult(name="Fake YAML load passed"),
            CheckResult(name="Fake required sections found"),
            CheckResult(name="Fake refs resolved"),
        )
        warnings = (
            IssueResult(severity="warning", message="Strict mode is using fake checks only."),
        ) if request.strict else ()
        return ValidateResult(
            spec_path=request.spec_path,
            ok=True,
            checks=checks,
            warnings=warnings,
        )

    def inspect(self, request: InspectRequest) -> InspectResult:
        rows_by_mode: dict[str, tuple[dict[str, Any], ...]] = {
            "overview": (
                {"name": "models", "count": 1, "detail": "fake user model"},
                {"name": "dtos", "count": 1, "detail": "fake user DTO"},
                {"name": "resources", "count": 1, "detail": "fake users resource"},
            ),
            "schemas": (
                {"name": "User", "kind": "model", "properties": 5},
                {"name": "UserDto", "kind": "dto", "properties": 4},
            ),
            "resources": (
                {"name": "users", "routes": 2, "operations": 4},
            ),
            "refs": (
                {"name": "#/schemas/User", "status": "resolved", "target": "User"},
                {"name": "#/schemas/UserDto", "status": "resolved", "target": "UserDto"},
            ),
            "content_types": (
                {"name": "application/json", "status": "supported", "uses": 3},
            ),
        }
        return InspectResult(
            spec_path=request.spec_path,
            mode=request.mode,
            summary=InspectSummary(
                schemas=2,
                resources=1,
                properties=9,
                responses=3,
                operations=4,
                content_types=1,
            ),
            rows=rows_by_mode.get(request.mode, ()),
        )

    def infer(self, request: InferRequest) -> InferResult:
        files = _planned_files()
        if request.only:
            allowed = set(request.only)
            files = tuple(file for file in files if file.group in allowed or "once" in allowed)
        return InferResult(
            spec_path=request.spec_path,
            language=request.language,
            output_path=request.output_path,
            files=files,
            show_context=request.show_context,
            show_paths=request.show_paths,
        )

    def emit(self, request: EmitRequest) -> EmitResult:
        planned = _planned_files()
        if request.only:
            allowed = set(request.only)
            planned = tuple(file for file in planned if file.group in allowed or "once" in allowed)

        if request.dry_run:
            files = tuple(
                WriteFileResult(path=request.output_path / file.path, status="planned")
                for file in planned
            )
        else:
            statuses = ("created", "created", "unchanged")
            files = tuple(
                WriteFileResult(path=request.output_path / file.path, status=status)
                for file, status in zip(planned, statuses, strict=False)
            )

        return EmitResult(
            spec_path=request.spec_path,
            language=request.language,
            output_path=request.output_path,
            dry_run=request.dry_run,
            files=files,
        )


def validate_spec(
    spec_path: Path,
    *,
    strict: bool = False,
    verbose: bool = False,
) -> ValidateResult:
    return GeneratorApp().validate(
        ValidateRequest(spec_path=spec_path, strict=strict, verbose=verbose),
    )


def inspect_spec(spec_path: Path, *, mode: str = "overview") -> InspectResult:
    return GeneratorApp().inspect(InspectRequest(spec_path=spec_path, mode=mode))


def infer_spec(
    spec_path: Path,
    *,
    language: str = "python",
    output_path: Path = Path("generated"),
) -> InferResult:
    return GeneratorApp().infer(
        InferRequest(spec_path=spec_path, language=language, output_path=output_path),
    )


def emit_spec(
    spec_path: Path,
    *,
    language: str = "python",
    output_path: Path = Path("generated"),
    dry_run: bool = False,
) -> EmitResult:
    return GeneratorApp().emit(
        EmitRequest(
            spec_path=spec_path,
            language=language,
            output_path=output_path,
            dry_run=dry_run,
        ),
    )


def _planned_files() -> tuple[PlannedFileResult, ...]:
    return (
        PlannedFileResult(
            path=Path("models/user.py"),
            template="model.py.j2",
            group="models",
            source="fake:user",
            context={"kind": "model", "name": "User", "fields": 5},
        ),
        PlannedFileResult(
            path=Path("dtos/user_dto.py"),
            template="dto.py.j2",
            group="dtos",
            source="fake:user_dto",
            context={"kind": "dto", "name": "UserDto", "fields": 4},
        ),
        PlannedFileResult(
            path=Path("__init__.py"),
            template="__init__.py.j2",
            group="once",
            source="fake:init",
            context={"kind": "package", "exports": ["User", "UserDto"]},
        ),
    )
