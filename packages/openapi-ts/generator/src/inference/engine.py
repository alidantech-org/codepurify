from __future__ import annotations

from inference.graph import collect_dependencies
from inference.models import InferenceGraph, InferredResource
from inference.operations.engine import infer_operations
from inference.schemas import infer_schemas
from openapi.document import OpenApiDocument


class InferenceEngine:
    def infer(self, document: OpenApiDocument) -> InferenceGraph:
        schemas = infer_schemas(document)
        operations = infer_operations(document)
        resources = _collect_resources(schemas, operations)
        dependencies = collect_dependencies(schemas, operations)

        return InferenceGraph(
            title=document.title,
            openapi_version=document.openapi_version,
            api_version=document.api_version,
            resources=resources,
            schemas=schemas,
            operations=operations,
            dependencies=dependencies,
        )


def _collect_resources(
    schemas: tuple,
    operations: tuple,
) -> tuple[InferredResource, ...]:
    resources: dict[str, InferredResource] = {}

    for item in (*schemas, *operations):
        resource = getattr(item, "resource", None)

        if resource is None:
            continue

        existing = resources.get(resource.key)
        if existing is None:
            resources[resource.key] = resource
            continue

        if not existing.path and resource.path:
            resources[resource.key] = resource

    return tuple(sorted(resources.values(), key=lambda item: item.key.lower()))
