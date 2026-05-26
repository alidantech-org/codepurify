from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from constants.files import DEBUG_LANGUAGE, FILE_SUMMARY, FOLDER_OPERATIONS, FOLDER_RESOURCES, FOLDER_SCHEMAS

# TODO: Replace with new emission.templates.planning module
# from emission.files import EmittedFile
# from emission.plan import EmissionPlan
from inference.models import InferenceGraph
from languages.debug.helpers import (
    build_operation_path,
    build_resource_path,
    build_schema_path,
)
from languages.debug.renderers import (
    operation_renderer,
    resource_renderer,
    schema_renderer,
    summary_renderer,
)


@dataclass(frozen=True)
class EmittedFile:
    """Temporary stub for old emission.files.EmittedFile"""

    path: Path
    content: str


@dataclass(frozen=True)
class EmissionPlan:
    """Temporary stub for old emission.plan.EmissionPlan"""

    language: str
    files: tuple[EmittedFile, ...]


class DebugEmitter:
    language = DEBUG_LANGUAGE

    def emit(self, graph: InferenceGraph) -> EmissionPlan:
        files: list[EmittedFile] = []

        files.append(
            EmittedFile(
                path=Path(FILE_SUMMARY),
                content=summary_renderer.render_summary(graph),
            )
        )

        for resource in graph.resources:
            files.append(
                EmittedFile(
                    path=build_resource_path(FOLDER_RESOURCES, resource.name),
                    content=resource_renderer.render_resource(resource, graph),
                )
            )

        for schema in graph.schemas:
            files.append(
                EmittedFile(
                    path=build_schema_path(FOLDER_SCHEMAS, schema.name, schema.kind),
                    content=schema_renderer.render_schema(schema),
                )
            )

        for operation in graph.operations:
            files.append(
                EmittedFile(
                    path=build_operation_path(FOLDER_OPERATIONS, operation.operation_id),
                    content=operation_renderer.render_operation(operation),
                )
            )

        return EmissionPlan(
            language=self.language,
            files=tuple(files),
        )
