from __future__ import annotations

from constants.files import (
    COL_OPERATIONS,
    COL_PATH,
    COL_RESOURCE,
    LABEL_DASH,
    ROW_API_VERSION,
    ROW_COMPONENT_REFS,
    ROW_MISSING_COMPONENT_REFS,
    ROW_OPENAPI,
    ROW_OPERATIONS,
    ROW_PARAMETERS,
    ROW_PATHS,
    ROW_REFS,
    ROW_REQUEST_BODIES,
    ROW_RESPONSES,
    ROW_SCHEMAS,
    ROW_TITLE,
    SEPARATOR_PATH,
    TITLE_DETECTED_RESOURCES,
    TITLE_OPENAPI_SUMMARY,
)
from core.logging import STYLE_VALUE_BOLD_CYAN, console, key_value_table
from openapi.inspector import OpenApiInspection


def present_inspection(inspection: OpenApiInspection) -> None:
    key_value_table(
        TITLE_OPENAPI_SUMMARY,
        [
            (ROW_TITLE, inspection.title),
            (ROW_OPENAPI, inspection.openapi_version),
            (ROW_API_VERSION, inspection.api_version),
            (ROW_PATHS, inspection.path_count),
            (ROW_OPERATIONS, inspection.operation_count),
            (ROW_SCHEMAS, inspection.schema_count),
            (ROW_RESPONSES, inspection.response_count),
            (ROW_REQUEST_BODIES, inspection.request_body_count),
            (ROW_PARAMETERS, inspection.parameter_count),
            (ROW_REFS, inspection.ref_count),
            (ROW_COMPONENT_REFS, inspection.component_ref_count),
            (ROW_MISSING_COMPONENT_REFS, inspection.missing_component_ref_count),
        ],
    )

    if inspection.resources:
        rows = [
            (
                resource.name,
                SEPARATOR_PATH.join(resource.path) if resource.path else LABEL_DASH,
                resource.operation_count,
            )
            for resource in inspection.resources
        ]

        from rich.table import Table

        table = Table(title=TITLE_DETECTED_RESOURCES, show_header=True, header_style=STYLE_VALUE_BOLD_CYAN)
        table.add_column(COL_RESOURCE)
        table.add_column(COL_PATH)
        table.add_column(COL_OPERATIONS)

        for name, path, count in rows:
            table.add_row(str(name), str(path), str(count))

        console.print(table)
