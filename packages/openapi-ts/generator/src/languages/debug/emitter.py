from __future__ import annotations

from pathlib import Path

from emission.files import EmittedFile
from emission.plan import EmissionPlan
from inference.models import InferenceGraph, InferredOperation, InferredResource, InferredSchema


class DebugEmitter:
    language = "debug"

    def emit(self, graph: InferenceGraph) -> EmissionPlan:
        files: list[EmittedFile] = []

        files.append(
            EmittedFile(
                path=Path("summary.txt"),
                content=_render_summary(graph),
            )
        )

        for resource in graph.resources:
            files.append(
                EmittedFile(
                    path=Path("resources") / f"{resource.key}.txt",
                    content=_render_resource(resource, graph),
                )
            )

        for schema in graph.schemas:
            files.append(
                EmittedFile(
                    path=Path("schemas") / f"{schema.name}.txt",
                    content=_render_schema(schema),
                )
            )

        for operation in graph.operations:
            files.append(
                EmittedFile(
                    path=Path("operations") / f"{operation.operation_id}.txt",
                    content=_render_operation(operation),
                )
            )

        return EmissionPlan(
            language=self.language,
            files=tuple(files),
        )


def _render_summary(graph: InferenceGraph) -> str:
    return "\n".join(
        [
            f"Title: {graph.title}",
            f"OpenAPI: {graph.openapi_version}",
            f"API Version: {graph.api_version}",
            f"Resources: {len(graph.resources)}",
            f"Schemas: {len(graph.schemas)}",
            f"Operations: {len(graph.operations)}",
            f"Dependencies: {len(graph.dependencies)}",
        ]
    )


def _render_resource(resource: InferredResource, graph: InferenceGraph) -> str:
    schemas = [schema for schema in graph.schemas if schema.resource == resource]
    operations = [operation for operation in graph.operations if operation.resource == resource]

    lines = [
        f"Resource: {resource.name}",
        f"Key: {resource.key}",
        f"Path: {'/'.join(resource.path) if resource.path else '-'}",
        "",
        f"Schemas: {len(schemas)}",
        f"Operations: {len(operations)}",
    ]

    if operations:
        lines.append("")
        lines.append("Operation IDs:")
        lines.extend(f"- {operation.operation_id}" for operation in operations)

    return "\n".join(lines)


def _render_schema(schema: InferredSchema) -> str:
    lines = [
        f"Schema: {schema.name}",
        f"Ref: {schema.ref}",
        f"Kind: {schema.kind.value}",
        f"Resource: {schema.resource.name if schema.resource else '-'}",
        f"Resource Key: {schema.resource.key if schema.resource else '-'}",
        f"x-codegen: {schema.x_codegen}",
        f"Is Alias: {schema.is_alias}",
        f"Alias Of: {schema.alias_of or '-'}",
        "",
        f"Dependencies: {len(schema.dependencies)}",
    ]

    if schema.dependencies:
        lines.extend(f"- {dependency}" for dependency in schema.dependencies)

    return "\n".join(lines)


def _render_operation(operation: InferredOperation) -> str:
    lines = [
        f"Operation: {operation.operation_id}",
        f"Method: {operation.method}",
        f"Path: {operation.path}",
        f"Resource: {operation.resource.name if operation.resource else '-'}",
        f"Resource Key: {operation.resource.key if operation.resource else '-'}",
        "",
        f"Parameters: {len(operation.parameter_refs)}",
        *[f"- {ref}" for ref in operation.parameter_refs],
        "",
        f"Request Bodies: {len(operation.request_body_refs)}",
        *[f"- {ref}" for ref in operation.request_body_refs],
        "",
        f"Responses: {len(operation.response_refs)}",
        *[f"- {ref}" for ref in operation.response_refs],
        "",
        f"All Schema Refs: {len(operation.schema_refs)}",
        *[f"- {ref}" for ref in operation.schema_refs],
    ]

    return "\n".join(lines)
