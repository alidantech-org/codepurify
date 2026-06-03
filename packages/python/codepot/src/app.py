"""Public application API used by the CLI and future integrations."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from spec.loader import load_spec
from spec.repository import SpecRepository
from utils.files.metadata import get_file_metadata

from .spec2 import SpecContentType, SpecCounts, SpecMetadata, SpecResource


class AppModel(BaseModel):
    """Base model configured for CLI-friendly serialization."""

    model_config = ConfigDict(frozen=True)


class BaseRequest(AppModel):
    """Shared request fields accepted by the fake app shell."""

    spec_path: Path
    language: str | None = None
    template_package_path: Path | None = None
    templates_path: Path | None = None
    output_path: Path | None = None
    select: str | None = None
    template_ids: tuple[str, ...] = ()
    only: tuple[str, ...] = ()
    strict: bool = False
    dry_run: bool = False
    force: bool = False
    format: bool = False
    run_hooks: bool = False
    skip_static: bool = False
    show_context: bool = False
    show_paths: bool = False
    show_imports: bool = False
    show_dependencies: bool = False
    verbose: bool = False


class ValidateRequest(BaseRequest):
    """Request to validate a Codepot spec."""


class InspectRequest(BaseRequest):
    """Request to inspect a Codepot spec."""

    mode: str = "overview"


class InferRequest(BaseRequest):
    """Request to infer generated files."""

    language: str = "typescript"
    template_package_path: Path = Path("templates/typescript")
    output_path: Path = Path("generated/typescript")


class EmitRequest(BaseRequest):
    """Request to emit generated files."""

    language: str = "typescript"
    template_package_path: Path = Path("templates/typescript")
    output_path: Path = Path("generated/typescript")


class TemplateValidateRequest(AppModel):
    template_package_path: Path


class TemplateInspectRequest(AppModel):
    template_package_path: Path


class TemplateVarsRequest(AppModel):
    template_package_path: Path
    select: str


class TemplateSelectionsRequest(AppModel):
    verbose: bool = False


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
    select: str = "once"
    status: str = "planned"
    context: dict[str, Any] = Field(default_factory=dict)


class WriteFileResult(AppModel):
    path: Path
    status: str
    template_id: str | None = None
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
    template_package_path: Path
    output_path: Path
    select: str | None = None
    template_ids: tuple[str, ...] = ()
    files: tuple[PlannedFileResult, ...]
    show_context: bool = False
    show_paths: bool = False
    show_imports: bool = False
    show_dependencies: bool = False
    imports: tuple[dict[str, str], ...] = ()
    dependencies: tuple[dict[str, str], ...] = ()


class EmitResult(AppModel):
    spec_path: Path
    language: str
    template_package_path: Path
    output_path: Path
    dry_run: bool
    format: bool = False
    run_hooks: bool = False
    skip_static: bool = False
    files: tuple[WriteFileResult, ...]
    formatter_command: str | None = None
    hook_commands: tuple[str, ...] = ()
    errors: tuple[IssueResult, ...] = ()


class TemplateValidateResult(AppModel):
    template_package_path: Path
    ok: bool
    checks: tuple[CheckResult, ...]
    warnings: tuple[IssueResult, ...] = ()
    errors: tuple[IssueResult, ...] = ()


class TemplateEntryResult(AppModel):
    id: str
    kind: str
    select: str
    template: str


class TemplateBarrelResult(AppModel):
    id: str
    template: str
    export: str


class TemplateInspectResult(AppModel):
    template_package_path: Path
    name: str
    language: str
    extension: str
    templates: tuple[TemplateEntryResult, ...]
    barrels: tuple[TemplateBarrelResult, ...]


class TemplateVarsResult(AppModel):
    template_package_path: Path
    select: str
    output_path_variables: tuple[str, ...]
    template_variables: tuple[str, ...]


class TemplateSelectionsResult(AppModel):
    selections: tuple[str, ...]
    hidden_subjects: tuple[str, ...] = ()


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
        if request.select:
            files = tuple(file for file in files if file.select == request.select)
        if request.template_ids:
            allowed = set(request.template_ids)
            files = tuple(file for file in files if file.group in allowed)
        return InferResult(
            spec_path=request.spec_path,
            language=request.language,
            template_package_path=request.template_package_path,
            output_path=request.output_path,
            select=request.select,
            template_ids=request.template_ids,
            files=files,
            show_context=request.show_context,
            show_paths=request.show_paths,
            show_imports=request.show_imports,
            show_dependencies=request.show_dependencies,
            imports=_fake_imports(),
            dependencies=_fake_dependencies(),
        )

    def emit(self, request: EmitRequest) -> EmitResult:
        planned = _planned_files()
        if request.select:
            planned = tuple(file for file in planned if file.select == request.select)
        if request.template_ids:
            allowed = set(request.template_ids)
            planned = tuple(file for file in planned if file.group in allowed)

        if request.dry_run:
            files = tuple(
                WriteFileResult(
                    path=request.output_path / file.path,
                    status="planned",
                    template_id=file.group,
                )
                for file in planned
            )
        else:
            statuses = ("created", "created", "unchanged")
            files = tuple(
                WriteFileResult(
                    path=request.output_path / file.path,
                    status=status,
                    template_id=file.group,
                )
                for file, status in zip(planned, statuses, strict=False)
            )

        return EmitResult(
            spec_path=request.spec_path,
            language=request.language,
            template_package_path=request.template_package_path,
            output_path=request.output_path,
            dry_run=request.dry_run,
            format=request.format,
            run_hooks=request.run_hooks,
            skip_static=request.skip_static,
            files=files,
            formatter_command="pnpm prettier --write .",
            hook_commands=("pnpm install", "pnpm tsc --noEmit"),
        )

    def template_validate(self, request: TemplateValidateRequest) -> TemplateValidateResult:
        checks = (
            CheckResult(name="Config file found", detail="codepot.yaml"),
            CheckResult(name="Template map valid", detail="11 templates"),
            CheckResult(name="Select declarations valid", detail="fake check"),
            CheckResult(name="Output paths valid", detail="fake check"),
            CheckResult(name="Resolves valid", detail="fake check"),
            CheckResult(name="Barrel refs valid", detail="fake check"),
        )
        return TemplateValidateResult(
            template_package_path=request.template_package_path,
            ok=True,
            checks=checks,
        )

    def template_inspect(self, request: TemplateInspectRequest) -> TemplateInspectResult:
        return TemplateInspectResult(
            template_package_path=request.template_package_path,
            name="typescript",
            language="typescript",
            extension="ts",
            templates=_fake_template_entries(),
            barrels=(
                TemplateBarrelResult(
                    id="enum_files/barrel",
                    template="enum/index.ts.j2",
                    export="named",
                ),
                TemplateBarrelResult(
                    id="model_files/barrel",
                    template="model/index.ts.j2",
                    export="named",
                ),
            ),
        )

    def template_vars(self, request: TemplateVarsRequest) -> TemplateVarsResult:
        return TemplateVarsResult(
            template_package_path=request.template_package_path,
            select=request.select,
            output_path_variables=_output_path_variables(),
            template_variables=_template_variables(request.select),
        )

    def template_selections(self, request: TemplateSelectionsRequest) -> TemplateSelectionsResult:
        hidden = ("primitives", "params") if request.verbose else ()
        return TemplateSelectionsResult(selections=_valid_selections(), hidden_subjects=hidden)


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
            path=Path("src/models/user.ts"),
            template="model/model.ts.j2",
            group="model_files",
            source="fake:user",
            select="models.each",
            context={"kind": "model", "name": "User", "fields": 5},
        ),
        PlannedFileResult(
            path=Path("src/dtos/users/dtos.ts"),
            template="dto/dto.ts.j2",
            group="dto_files",
            source="fake:user_dto",
            select="dtos.by_owner",
            context={"kind": "dto", "name": "UserDto", "fields": 4},
        ),
        PlannedFileResult(
            path=Path("src/index.ts"),
            template="src/index.ts.j2",
            group="index",
            source="fake:init",
            select="once",
            context={"kind": "package", "exports": ["User", "UserDto"]},
        ),
    )


def _fake_imports() -> tuple[dict[str, str], ...]:
    return (
        {
            "path": "src/models/user.ts",
            "symbol": "UserRole",
            "source": "src/enums/index.ts",
        },
    )


def _fake_dependencies() -> tuple[dict[str, str], ...]:
    return (
        {
            "template": "model_files",
            "kind": "resolves enums",
            "target": "#/templates/enum_files/barrel",
        },
        {
            "template": "model_files",
            "kind": "resolves composites",
            "target": "#/templates/composite_files",
        },
    )


def _fake_template_entries() -> tuple[TemplateEntryResult, ...]:
    return (
        TemplateEntryResult(
            id="package_json",
            kind="package",
            select="once",
            template="package.json.j2",
        ),
        TemplateEntryResult(
            id="enum_files",
            kind="source",
            select="enums.each",
            template="enum/enum.ts.j2",
        ),
        TemplateEntryResult(
            id="model_files",
            kind="source",
            select="models.each",
            template="model/model.ts.j2",
        ),
        TemplateEntryResult(
            id="dto_files",
            kind="source",
            select="dtos.by_owner",
            template="dto/dto.ts.j2",
        ),
        TemplateEntryResult(
            id="resource_files",
            kind="source",
            select="resources.each",
            template="resource/resource.ts.j2",
        ),
    )


def _output_path_variables() -> tuple[str, ...]:
    return (
        "project.key",
        "project.title",
        "language.name",
        "language.extension",
        "template.id",
        "template.kind",
        "template.select",
        "item.key",
        "item.name.path",
        "item.name.pascal",
        "owner.key",
        "owner.name.path",
        "owner.folders",
        "global.alias",
    )


def _template_variables(select: str) -> tuple[str, ...]:
    common = (
        "global",
        "project",
        "spec",
        "language",
        "template",
        "path",
    )
    if select.startswith("models"):
        return common + (
            "model",
            "model.name.*",
            "model.fields[]",
            "model.fields[].name.*",
            "model.fields[].type",
            "model.fields[].format",
            "model.fields[].validation",
            "model.fields[].required",
            "model.fields[].nullable",
            "model.fields[].array",
            "model.fields[].lang.annotation",
            "model.fields[].lang.field_name",
            "model.imports[]",
            "dependencies.enums[]",
            "dependencies.composites[]",
            "dependencies.models[]",
        )
    return common + ("item", "item.name.*", "dependencies[]")


def _valid_selections() -> tuple[str, ...]:
    return (
        "content_types.all",
        "enums.each",
        "enums.all",
        "enums.by_owner",
        "composites.each",
        "composites.all",
        "composites.by_owner",
        "entities.each",
        "entities.all",
        "entities.by_owner",
        "field_sets.each",
        "field_sets.all",
        "field_sets.by_owner",
        "models.each",
        "models.all",
        "models.by_owner",
        "dtos.each",
        "dtos.all",
        "dtos.by_owner",
        "resources.each",
        "resources.all",
        "operations.each",
        "operations.all",
        "operations.by_resource",
        "route_paths.each",
        "route_paths.all",
        "route_paths.by_resource",
        "routes.each",
        "routes.all",
        "routes.by_resource",
        "errors.each",
        "errors.all",
        "errors.by_owner",
        "security_credentials.each",
        "security_credentials.all",
        "security_principals.each",
        "security_principals.all",
        "security_policies.each",
        "security_policies.all",
        "once",
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
