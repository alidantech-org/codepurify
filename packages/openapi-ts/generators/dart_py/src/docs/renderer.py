from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from core.paths import DOCS_TEMPLATES_DIR, require_existing_dir

OpenApiSpec = dict[str, Any]


def create_jinja_env() -> Environment:
    templates_dir = require_existing_dir(DOCS_TEMPLATES_DIR, "Docs templates directory")

    return Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(enabled_extensions=()),
        trim_blocks=True,
        lstrip_blocks=True,
    )


def render_template(template_name: str, context: dict[str, Any]) -> str:
    env = create_jinja_env()
    template = env.get_template(template_name)
    return template.render(**context)
