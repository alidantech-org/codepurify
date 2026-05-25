from __future__ import annotations

from constants.files import (
    LABEL_API_VERSION,
    LABEL_DEPENDENCIES,
    LABEL_OPENAPI,
    LABEL_OPERATIONS,
    LABEL_RESOURCES,
    LABEL_SCHEMAS,
    LABEL_TITLE,
    SEPARATOR_COLON,
)
from inference.models import InferenceGraph


def render_summary(graph: InferenceGraph) -> str:
    return "\n".join(
        [
            f"{LABEL_TITLE}{SEPARATOR_COLON}{graph.title}",
            f"{LABEL_OPENAPI}{SEPARATOR_COLON}{graph.openapi_version}",
            f"{LABEL_API_VERSION}{SEPARATOR_COLON}{graph.api_version}",
            f"{LABEL_RESOURCES}{SEPARATOR_COLON}{len(graph.resources)}",
            f"{LABEL_SCHEMAS}{SEPARATOR_COLON}{len(graph.schemas)}",
            f"{LABEL_OPERATIONS}{SEPARATOR_COLON}{len(graph.operations)}",
            f"{LABEL_DEPENDENCIES}{SEPARATOR_COLON}{len(graph.dependencies)}",
        ]
    )
