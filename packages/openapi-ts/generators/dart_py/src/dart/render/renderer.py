"""
Jinja2 template rendering for generated Dart files.

This module converts generation plans into actual Dart source files by
rendering Jinja2 templates and writing the output to disk.

This module must not:
- decide required fields
- classify schemas
- resolve nullable types
- inspect OpenAPI deeply
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from constants.dart_syntax import (
    DART_CONTEXT_KEY_GENERATED_AT,
    DART_CONTEXT_KEY_OUTPUT_PATH,
    DART_CONTEXT_KEY_PLAN,
    DART_CONTEXT_KEY_SOURCE_FILE,
    DART_DEFAULT_SOURCE_FILE,
    DART_FILE_ENCODING,
    DART_LOG_CONTENT_PREFIX,
    DART_LOG_DRY_RUN_PREFIX,
    DART_LOG_WROTE_PREFIX,
    DART_TEMPLATE_CLASS,
    DART_TEMPLATE_ENUM,
    DART_TEMPLATE_FIELDS,
)
from constants.templates import (
    TEMPLATE_BARREL,
    TEMPLATE_FEATURE,
    TEMPLATE_ROUTE_ENDPOINTS,
    TEMPLATE_ROUTE_VERSION,
)
from core.paths import DART_TEMPLATES_DIR, require_existing_dir
from logger import get_logger
from ..planning.enum_plan import DartEnumPlan

log = get_logger(__name__)

_env = Environment(
    loader=FileSystemLoader(
        require_existing_dir(
            DART_TEMPLATES_DIR,
            "Dart templates directory",
        )
    ),
    autoescape=select_autoescape(),
    trim_blocks=True,
    lstrip_blocks=True,
)


def build_template_context(
    plan: Any,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
    output_path: Path | None = None,
) -> dict[str, Any]:
    """Build standard template context for generated Dart files."""
    resolved_output_path = output_path or get_plan_output_path(plan)

    return {
        DART_CONTEXT_KEY_PLAN: plan,
        DART_CONTEXT_KEY_GENERATED_AT: build_generated_at(),
        DART_CONTEXT_KEY_SOURCE_FILE: source_file,
        DART_CONTEXT_KEY_OUTPUT_PATH: str(resolved_output_path),
    }


def build_generated_at() -> str:
    """Build a human-readable generation date."""
    return datetime.now().strftime("%A, %B %d, %Y")


def get_plan_output_path(plan: Any) -> Path:
    """Resolve the preferred output path from a generation plan."""
    if hasattr(plan, "model_path"):
        return plan.model_path

    if hasattr(plan, "fields_path"):
        return plan.fields_path

    if hasattr(plan, "output_path"):
        return plan.output_path

    if hasattr(plan, "folder") and hasattr(plan, "file_name"):
        return plan.folder / plan.file_name

    raise ValueError(f"Cannot resolve output path for plan type: {type(plan).__name__}")


def render_enum(
    plan: DartEnumPlan,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render an enum plan to enum.dart."""
    output_path = output_dir / version_folder / plan.output_path

    render_template_to_file(
        template_name=DART_TEMPLATE_ENUM,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=plan.output_path,
        ),
        dry_run=dry_run,
    )


def render_class(
    plan: Any,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render a class plan to model.dart."""
    output_path = output_dir / version_folder / plan.model_path

    render_template_to_file(
        template_name=DART_TEMPLATE_CLASS,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=plan.model_path,
        ),
        dry_run=dry_run,
    )


def render_fields(
    plan: Any,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render a class plan fields file to fields.dart."""
    output_path = output_dir / version_folder / plan.fields_path

    render_template_to_file(
        template_name=DART_TEMPLATE_FIELDS,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=plan.fields_path,
        ),
        dry_run=dry_run,
    )


def render_barrel(
    plan: Any,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render a barrel index.dart file."""
    output_path = output_dir / version_folder / plan.output_path

    render_template_to_file(
        template_name=TEMPLATE_BARREL,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=plan.output_path,
        ),
        dry_run=dry_run,
    )


def render_route_version(
    plan: Any,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render a route version file."""
    relative_path = plan.folder / plan.file_name
    output_path = output_dir / version_folder / relative_path

    render_template_to_file(
        template_name=TEMPLATE_ROUTE_VERSION,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=relative_path,
        ),
        dry_run=dry_run,
    )


def render_endpoint_group(
    plan: Any,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render an endpoint group constants file."""
    relative_path = plan.folder / plan.file_name
    output_path = output_dir / version_folder / relative_path

    render_template_to_file(
        template_name=TEMPLATE_ROUTE_ENDPOINTS,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=relative_path,
        ),
        dry_run=dry_run,
    )


def render_feature(
    plan: Any,
    output_dir: Path,
    version_folder: str = "latest",
    dry_run: bool = False,
    source_file: str = DART_DEFAULT_SOURCE_FILE,
) -> None:
    """Render a feature orchestrator file."""
    relative_path = plan.folder / plan.file_name
    output_path = output_dir / version_folder / relative_path

    render_template_to_file(
        template_name=TEMPLATE_FEATURE,
        output_path=output_path,
        context=build_template_context(
            plan=plan,
            source_file=source_file,
            output_path=relative_path,
        ),
        dry_run=dry_run,
    )


def render_template(
    template_name: str,
    output_path: Path,
    context: dict[str, Any],
    dry_run: bool = False,
) -> None:
    """
    Render a generic template.

    Kept for compatibility with existing callers.
    Prefer render_template_to_file() in new code.
    """
    render_template_to_file(
        template_name=template_name,
        output_path=output_path,
        context=context,
        dry_run=dry_run,
    )


def render_template_to_file(
    template_name: str,
    output_path: Path,
    context: dict[str, Any],
    dry_run: bool = False,
) -> None:
    """Render a Jinja template and write it to disk."""
    template = _env.get_template(template_name)
    content = template.render(**context)

    write_rendered_content(
        output_path=output_path,
        content=content,
        dry_run=dry_run,
    )


def write_rendered_content(
    output_path: Path,
    content: str,
    dry_run: bool = False,
) -> None:
    """Write rendered content or log dry-run output."""
    if dry_run:
        log.info(f"{DART_LOG_DRY_RUN_PREFIX}{output_path}")
        log.debug(f"{DART_LOG_CONTENT_PREFIX}{content}")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding=DART_FILE_ENCODING)
    log.info(f"{DART_LOG_WROTE_PREFIX}{output_path}")
