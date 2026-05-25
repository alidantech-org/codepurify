from __future__ import annotations

from inference.models import InferredDependency, InferredOperation, InferredSchema


def collect_dependencies(
    schemas: tuple[InferredSchema, ...],
    operations: tuple[InferredOperation, ...],
) -> tuple[InferredDependency, ...]:
    dependencies: list[InferredDependency] = []

    for schema in schemas:
        for target_ref in schema.dependencies:
            dependencies.append(
                InferredDependency(
                    source_ref=schema.ref,
                    target_ref=target_ref,
                )
            )

    for operation in operations:
        source_ref = f"operation:{operation.operation_id}"

        for target_ref in operation.schema_refs:
            dependencies.append(
                InferredDependency(
                    source_ref=source_ref,
                    target_ref=target_ref,
                )
            )

    return tuple(_dedupe_dependencies(dependencies))


def _dedupe_dependencies(
    dependencies: list[InferredDependency],
) -> list[InferredDependency]:
    seen: set[tuple[str, str]] = set()
    result: list[InferredDependency] = []

    for dependency in dependencies:
        key = (dependency.source_ref, dependency.target_ref)
        if key in seen:
            continue

        seen.add(key)
        result.append(dependency)

    return result
