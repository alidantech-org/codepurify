"""Schema classification for API contracts.

This module classifies schemas into logical groups based on their kind and
metadata, enabling templates to emit only the schemas they need.
"""

from __future__ import annotations

from contracts.api import ApiSchema, ApiSchemaGroups


def classify_schemas(schemas: tuple[ApiSchema, ...]) -> ApiSchemaGroups:
    """Classify schemas into logical groups for template contracts.

    Args:
        schemas: All schemas from inference.

    Returns:
        Classified schema groups with all, models, dtos, enums, primitives,
        aliases, and emit views.
    """
    primitives = tuple(s for s in schemas if s.kind == "primitive")
    enums = tuple(s for s in schemas if s.kind == "enum")
    models = tuple(s for s in schemas if s.kind == "model")
    dtos = tuple(s for s in schemas if s.kind == "dto")
    aliases = tuple(s for s in schemas if s.is_alias)

    # TODO: Classify DTO roles (queries, params, bodies, responses) from metadata
    # For now, these remain empty until inference adds role metadata
    queries = tuple()
    params = tuple()
    bodies = tuple()
    responses = tuple()

    return ApiSchemaGroups(
        all=schemas,
        models=models,
        dtos=dtos,
        enums=enums,
        primitives=primitives,
        aliases=aliases,
        queries=queries,
        params=params,
        bodies=bodies,
        responses=responses,
        emit_models=models,
        emit_dtos=dtos,
        emit_enums=enums,
    )
