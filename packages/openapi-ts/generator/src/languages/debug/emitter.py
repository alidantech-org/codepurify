from __future__ import annotations

from pathlib import Path

from constants.files import DEBUG_LANGUAGE, FILE_SUMMARY, FOLDER_OPERATIONS, FOLDER_RESOURCES, FOLDER_SCHEMAS
from emission.files import EmittedFile
from emission.plan import EmissionPlan
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
                    path=build_resource_path(FOLDER_RESOURCES, resource.key),
                    content=resource_renderer.render_resource(resource, graph),
                )
            )

        for schema in graph.schemas:
            files.append(
                EmittedFile(
                    path=build_schema_path(FOLDER_SCHEMAS, schema.name),
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
