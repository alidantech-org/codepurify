"""
Main table printer coordinator.
"""

from logger import console
from ..models import DartInspection
from .summary_table import print_summary_table
from .tags_table import print_tags_table
from .class_plans_table import print_class_plans_table
from .route_plans_table import print_route_plans_table
from .feature_plans_table import print_feature_plans_table
from .enum_plans_table import print_enum_plans_table
from .operation_plans_table import print_operation_plans_table
from .debug import print_debug_inspection


def print_dart_inspection(inspection: DartInspection) -> None:
    """Print all standard Dart inspection tables."""
    console.print("[bold green]OpenAPI loaded successfully[/bold green]")

    print_summary_table(inspection)
    print_tags_table(inspection)
    print_class_plans_table(inspection)
    print_route_plans_table(inspection)
    print_feature_plans_table(inspection)
    print_enum_plans_table(inspection)
    print_operation_plans_table(inspection)

    if inspection.debug:
        print_debug_inspection(inspection)
