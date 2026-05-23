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
from .codegen_metadata_table import print_codegen_metadata_table, print_operation_codegen_metadata_table
from .composition_table import print_composition_table
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

    # Print x-codegen metadata tables
    schemas = inspection.spec.get("components", {}).get("schemas", {})
    if schemas:
        print_codegen_metadata_table(schemas)

    paths = inspection.spec.get("paths", {})
    if paths:
        print_operation_codegen_metadata_table(paths)

    # Print composition table for inheritance
    if inspection.plans and hasattr(inspection.plans, "class_plans"):
        print_composition_table(inspection.plans.class_plans, console)

    if inspection.debug:
        print_debug_inspection(inspection)
