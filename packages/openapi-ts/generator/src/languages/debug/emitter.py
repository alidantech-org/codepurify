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
    render_operation,
    render_resource,
    render_schema,
    render_summary,
)


class DebugEmitter:
    language = DEBUG_LANGUAGE

    def emit(self, graph: InferenceGraph) -> EmissionPlan:
        files: list[EmittedFile] = []

        files.append(
            EmittedFile(
                path=Path(FILE_SUMMARY),
                content=render_summary(graph),
            )
        )

        for resource in graph.resources:
            files.append(
                EmittedFile(
                    path=build_resource_path(FOLDER_RESOURCES, resource.key),
                    content=render_resource(resource, graph),
                )
            )

        for schema in graph.schemas:
            files.append(
                EmittedFile(
                    path=build_schema_path(FOLDER_SCHEMAS, schema.name),
                    content=render_schema(schema),
                )
            )

        for operation in graph.operations:
            files.append(
                EmittedFile(
                    path=build_operation_path(FOLDER_OPERATIONS, operation.operation_id),
                    content=render_operation(operation),
                )
            )

        return EmissionPlan(
            language=self.language,
            files=tuple(files),
        )
