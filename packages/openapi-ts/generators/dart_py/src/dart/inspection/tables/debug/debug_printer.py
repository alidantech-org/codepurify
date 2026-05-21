"""
Debug table printer coordinator.
"""

from ...models import DartInspection
from .response_inference_table import print_response_inference_table
from .operation_dto_details_table import print_operation_dto_details_table
from .symbols_table import print_symbols_table
from .schema_usage_table import print_schema_usage_table


def print_debug_inspection(inspection: DartInspection) -> None:
    """Print all debug Dart inspection tables."""
    print_response_inference_table(inspection)
    print_operation_dto_details_table(inspection)
    print_symbols_table(inspection)
    print_schema_usage_table(inspection)
