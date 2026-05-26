"""Debug language adapter."""

from __future__ import annotations

from pathlib import Path

from contracts.api import ApiContract, ApiOperation, ApiResource, ApiSchema
from contracts.emission import EmissionResult
from contracts.events import ProgressSink, RuntimeEvent
from contracts.language import LanguagePostResult
from contracts.names import make_contract_name
from contracts.template import (
    TemplateContract,
    TemplateEmit,
    TemplateLanguage,
    TemplateOperation,
    TemplateProject,
    TemplateResource,
    TemplateSchema,
)
from languages.decorators import language_adapter


@language_adapter(name="debug", aliases=("txt",), template_name="debug")
class DebugLanguageAdapter:
    """Build debug template contracts from the API contract."""

    name: str
    aliases: tuple[str, ...]
    template_name: str

    def build_template_contract(
        self,
        *,
        api: ApiContract,
        output_path: Path,
        template_root: Path | None = None,
        dry_run: bool = False,
        progress: ProgressSink | None = None,
    ) -> TemplateContract:
        """Build deterministic debug template variables."""
        _notify(progress, "building_debug_contract", "Building debug template contract")

        return TemplateContract(
            project=TemplateProject(
                name=make_contract_name("debug"),
                version="debug",
                description="Debug text emission",
            ),
            api=api,
            lang=TemplateLanguage(
                name=self.name,
                framework={"name": "none"},
                package={"name": "debug"},
                features={"text_reports": True},
                meta={"template_name": self.template_name},
            ),
            emit=TemplateEmit(
                output_path=output_path,
                template_root=template_root,
                dry_run=dry_run,
            ),
            resources=tuple(_resource(resource) for resource in api.resources),
            schemas=tuple(_schema(schema) for schema in api.schemas),
            operations=tuple(_operation(operation) for operation in api.operations),
        )

    def after_emit(
        self,
        *,
        result: EmissionResult,
        progress: ProgressSink | None = None,
    ) -> LanguagePostResult:
        """Debug language has no post-actions."""
        _notify(progress, "debug_post_actions", "No debug post-actions required")
        return LanguagePostResult()


def _resource(resource: ApiResource) -> TemplateResource:
    return TemplateResource(
        api=resource,
        name=resource.name,
        lang={
            "kind": "debug_resource",
        },
        emit={
            "group": "resources",
            "path_parts": ("resources", resource.name.path),
        },
        docs={},
        meta={},
    )


def _schema(schema: ApiSchema) -> TemplateSchema:
    return TemplateSchema(
        api=schema,
        name=schema.name,
        fields=(),
        lang={
            "kind": "debug_schema",
            "type": schema.kind,
        },
        emit={
            "group": "schemas",
            "path_parts": ("schemas", schema.name.path),
        },
        docs={
            "description": schema.description,
        },
        meta={},
    )


def _operation(operation: ApiOperation) -> TemplateOperation:
    return TemplateOperation(
        api=operation,
        name=operation.name,
        parameters=(),
        responses=(),
        lang={
            "kind": "debug_operation",
            "function_name": operation.name.snake,
        },
        emit={
            "group": "operations",
            "path_parts": ("operations", operation.name.path),
        },
        docs={
            "description": operation.description,
        },
        meta={},
    )


def _notify(progress: ProgressSink | None, stage: str, message: str) -> None:
    if progress is None:
        return

    progress(RuntimeEvent(stage=stage, message=message))
