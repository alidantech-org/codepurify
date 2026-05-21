"""
Response inference table printer (debug mode).
"""

from rich.table import Table

from constants.openapi_keys import (
    HTTP_METHODS,
    OPENAPI_OPERATION_ID,
    OPENAPI_PATHS,
    OPENAPI_RESPONSES,
)
from dart.planning.operation_usage import extract_schema_from_response
from logger import console
from ...models import DartInspection


def print_response_inference_table(inspection: DartInspection) -> None:
    """Print Response Inference table."""
    plans = inspection.plans

    response_table = Table(title="Response Inference")
    response_table.add_column("#", style="dim")
    response_table.add_column("Operation", style="cyan")
    response_table.add_column("Status", style="yellow")
    response_table.add_column("Schema", style="green")
    response_table.add_column("Usage", style="magenta")
    response_table.add_column("Generated", style="blue")
    response_table.add_column("SDK Type", style="dim")

    row_num = 1
    for path, path_item in inspection.spec.get(OPENAPI_PATHS, {}).items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue
            if not isinstance(operation, dict):
                continue
            operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")
            responses = operation.get(OPENAPI_RESPONSES, {})
            for status, response in responses.items():
                if not isinstance(response, dict):
                    continue
                schema_ref = extract_schema_from_response(response, inspection.spec)
                generated = "Yes" if schema_ref and schema_ref in plans.classes else "No"
                sdk_type = "Response" if status.startswith("2") else "Error"
                response_table.add_row(
                    str(row_num),
                    operation_id,
                    status,
                    schema_ref or "-",
                    "response",
                    generated,
                    sdk_type,
                )
                row_num += 1

    console.print(response_table)
