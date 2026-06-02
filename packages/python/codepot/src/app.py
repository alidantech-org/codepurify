"""Public application API used by the CLI and future integrations."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from contracts.spec import SpecContentType, SpecCounts, SpecMetadata, SpecResource
from spec.loader import load_spec
from spec.repository import SpecRepository
from utils.files.metadata import get_file_metadata


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
    version: str = "unknown"
    content_types: int = 0
    primitives: int = 0
    enums: int = 0
    composites: int = 0
    schemas: int = 0
    entities: int = 0
    field_sets: int = 0
    models: int = 0
    dtos: int = 0
    params: int = 0
    resources: int = 0
    properties: int = 0
    responses: int = 0
    operations: int = 0
    routes: int = 0
    security: int = 0


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
    metadata: SpecMetadata | None = None
    counts: SpecCounts | None = None
    warnings: tuple[IssueResult, ...] = ()
    errors: tuple[IssueResult, ...] = ()


class InspectResult(AppModel):
    spec_path: Path
    mode: str
    summary: InspectSummary
    metadata: SpecMetadata | None = None
    counts: SpecCounts | None = None
    rows: tuple[dict[str, Any], ...] = ()
    errors: tuple[IssueResult, ...] = ()


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
    """Public app shell used by the CLI."""

    def validate(self, request: ValidateRequest) -> ValidateResult:
        checks: list[CheckResult] = []
        try:
            file_metadata = get_file_metadata(request.spec_path)
            checks.append(CheckResult(name="Spec file found", detail=file_metadata.size_label))

            document = load_spec(request.spec_path)
            checks.append(
                CheckResult(name="YAML parsed", detail=f"{file_metadata.line_count:,} lines"),
            )

            repository = SpecRepository.from_data(document, file_metadata=file_metadata)
            metadata = repository.metadata()
            counts = repository.counts()
            checks.extend(
                (
                    CheckResult(
                        name="Pydantic validation passed",
                        detail=f"Codepot IR {metadata.project.codepot_version}",
                    ),
                    CheckResult(
                        name="Repository built",
                        detail=f"{counts.records_total:,} records",
                    ),
                    CheckResult(
                        name="Required sections present",
                        detail="info, properties, schemas, resources",
                    ),
                ),
            )
        except Exception as exc:
            checks.append(CheckResult(name="Spec load and validation failed", ok=False))
            return ValidateResult(
                spec_path=request.spec_path,
                ok=False,
                checks=tuple(checks),
                errors=_issues_from_exception(exc),
            )

        warnings = ()
        if request.strict:
            warnings = (
                IssueResult(
                    severity="warning",
                    message="Strict mode currently uses the same repository validation checks.",
                ),
            )
        return ValidateResult(
            spec_path=request.spec_path,
            ok=True,
            checks=tuple(checks),
            metadata=metadata,
            counts=counts,
            warnings=warnings,
        )

    def inspect(self, request: InspectRequest) -> InspectResult:
        try:
            repository = SpecRepository.from_file(request.spec_path)
            context = repository.context()
            metadata = context.metadata
            counts = context.counts
        except Exception as exc:
            return InspectResult(
                spec_path=request.spec_path,
                mode=request.mode,
                summary=InspectSummary(),
                errors=_issues_from_exception(exc),
            )

        rows_by_mode = {
            "overview": (),
            "schemas": _schema_rows(counts),
            "resources": _resource_rows(context.resources),
            "refs": ({"name": "refs", "status": "not implemented yet"},),
            "content_types": _content_type_rows(context.content_types),
        }
        return InspectResult(
            spec_path=request.spec_path,
            mode=request.mode,
            summary=InspectSummary(**repository.summary()),
            metadata=metadata,
            counts=counts,
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


def _schema_rows(counts: SpecCounts) -> tuple[dict[str, Any], ...]:
    return (
        {"name": "entities", "count": counts.entities},
        {"name": "field_sets", "count": counts.field_sets},
        {"name": "models", "count": counts.models},
        {"name": "dtos", "count": counts.dtos},
        {"name": "params", "count": counts.params},
    )


def _resource_rows(resources: tuple[SpecResource, ...]) -> tuple[dict[str, Any], ...]:
    return tuple(
        {
            "name": resource.record.key,
            "base_path": resource.base_path,
            "routes": len(resource.routes),
            "operations": len(resource.operations),
        }
        for resource in resources
    )


def _content_type_rows(content_types: tuple[SpecContentType, ...]) -> tuple[dict[str, Any], ...]:
    return tuple(
        {
            "name": content_type.record.key,
            "type": content_type.media_type,
            "strategy": content_type.strategy.value,
        }
        for content_type in content_types
    )


def _issues_from_exception(exc: Exception) -> tuple[IssueResult, ...]:
    if isinstance(exc, ValidationError):
        errors = exc.errors()
        issues = tuple(
            IssueResult(
                severity="error",
                message=str(error.get("msg", "Validation error")),
                path=_format_error_path(error.get("loc", ())),
                hint=str(error.get("type", "")) or None,
            )
            for error in errors[:20]
        )
        if len(errors) > 20:
            issues += (
                IssueResult(
                    severity="warning",
                    message=f"{len(errors) - 20} additional validation errors hidden.",
                ),
            )
        return issues

    return (
        IssueResult(
            severity="error",
            message=str(exc),
            path=None,
            hint=type(exc).__name__,
        ),
    )


def _format_error_path(location: object) -> str:
    if not isinstance(location, tuple):
        return str(location)
    if not location:
        return "."
    return ".".join(str(part) for part in location)
