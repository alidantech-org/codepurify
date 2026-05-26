"""Workflow for emit-plan command."""

from __future__ import annotations

from pathlib import Path

from constants.emission import (
    DEBUG_TEMPLATES_DIR,
    TEMPLATES_DIR,
)
from core.config import RuntimeContext
from core.logging import debug
from emission.planning import build_render_plan
from emission.templates.scanner import scan_templates
from inference.engine import InferenceEngine
from inference.models import InferenceGraph
from languages import get_language_planner
from openapi.loader import load_openapi_document


def run_emit_plan(
    context: RuntimeContext,
    input_path: Path | None = None,
    language: str = "dart",
    templates_path: Path | None = None,
) -> str:
    """Run emit-plan workflow and return the rendered plan."""
    debug(f"Emit plan language: {language}", context.options.debug)

    templates_root = templates_path or Path(TEMPLATES_DIR)
    template_root = templates_root / language
    debug_template_root = Path(DEBUG_TEMPLATES_DIR)

    if not template_root.exists():
        available = _list_available_languages(templates_root)
        available_str = ", ".join(available) if available else "none"
        raise FileNotFoundError(f"Template directory not found: {template_root}\n" f"Available languages: {available_str}")

    descriptors = scan_templates(template_root)

    # Load inference graph if input provided
    graph: InferenceGraph | None = None
    if input_path:
        debug(f"Loading OpenAPI from: {input_path}", context.options.debug)
        document = load_openapi_document(input_path)
        graph = InferenceEngine().infer(document)
    else:
        # Use empty graph for template-only preview
        graph = InferenceGraph(
            title="",
            openapi_version="",
            api_version="",
            resources=(),
            schemas=(),
            operations=(),
            dependencies=(),
        )

    planner = get_language_planner(language)
    contexts = planner.build_render_contexts(graph=graph)
    planned = build_render_plan(descriptors, contexts)

    output = render_emit_plan_debug(
        debug_template_root=debug_template_root,
        language=language,
        template_root=template_root,
        descriptors=descriptors,
        planned=planned,
    )

    return output


def _list_available_languages(templates_root: Path) -> list[str]:
    """List available language directories in templates root."""
    if not templates_root.exists() or not templates_root.is_dir():
        return []

    return [d.name for d in templates_root.iterdir() if d.is_dir() and not d.name.startswith(".")]
