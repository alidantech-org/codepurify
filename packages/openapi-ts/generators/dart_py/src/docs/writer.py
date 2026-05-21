import shutil
from pathlib import Path
from typing import Any

from constants.app import (
    OUTPUT_FILE_INDEX,
    OUTPUT_FILE_MODELS,
    TEMPLATE_CTX_INFO,
    TEMPLATE_CTX_OPERATION_COUNT,
    TEMPLATE_CTX_OPENAPI_VERSION,
    TEMPLATE_CTX_OPERATIONS,
    TEMPLATE_CTX_SCHEMA_COUNT,
    TEMPLATE_CTX_SCHEMAS,
    TEMPLATE_CTX_TAG,
    TEMPLATE_CTX_TAGS,
    TEMPLATE_DOCS_INDEX,
    TEMPLATE_DOCS_MODELS,
    TEMPLATE_DOCS_TAG,
)
from constants.openapi_keys import OPENAPI_INFO, OPENAPI_VERSION

from docs.collector import collect_important_schemas, collect_operations_by_tag
from docs.renderer import render_template
from utils.files import ensure_dir, write_text
from utils.naming import snake_case

OpenApiSpec = dict[str, Any]


def generate_docs(
    spec: OpenApiSpec,
    output: Path,
    clean: bool = False,
    dry_run: bool = False,
) -> None:
    if clean and output.exists() and not dry_run:
        shutil.rmtree(output)

    ensure_dir(output)

    operations_by_tag = collect_operations_by_tag(spec)
    schemas = collect_important_schemas(spec)

    info = spec.get(OPENAPI_INFO, {})

    index_content = render_template(
        TEMPLATE_DOCS_INDEX,
        {
            TEMPLATE_CTX_INFO: info,
            TEMPLATE_CTX_OPENAPI_VERSION: spec.get(OPENAPI_VERSION),
            TEMPLATE_CTX_TAGS: list(operations_by_tag.keys()),
            TEMPLATE_CTX_OPERATION_COUNT: sum(len(items) for items in operations_by_tag.values()),
            TEMPLATE_CTX_SCHEMA_COUNT: len(schemas),
        },
    )

    write_text(output / OUTPUT_FILE_INDEX, index_content, dry_run=dry_run)

    for tag, operations in operations_by_tag.items():
        content = render_template(
            TEMPLATE_DOCS_TAG,
            {
                TEMPLATE_CTX_TAG: tag,
                TEMPLATE_CTX_OPERATIONS: operations,
            },
        )

        write_text(output / f"{snake_case(tag)}.md", content, dry_run=dry_run)

    models_content = render_template(
        TEMPLATE_DOCS_MODELS,
        {
            TEMPLATE_CTX_SCHEMAS: schemas,
        },
    )

    write_text(output / OUTPUT_FILE_MODELS, models_content, dry_run=dry_run)
