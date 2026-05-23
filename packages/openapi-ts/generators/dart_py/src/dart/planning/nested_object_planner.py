"""
Nested object model planning.

This module handles the planning of inline/nested object schemas as full Dart classes.
Nested objects are emitted inside their parent model folder with proper naming and structure.

This module must not:
- handle class field logic for non-nested classes
- generate operation/client plans
- render templates
- write files
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.dart_keywords import DART_RESERVED_WORDS
from constants.openapi_keys import (
    OPENAPI_PROPERTIES,
    OPENAPI_TYPE,
    OPENAPI_TYPE_OBJECT,
    OPENAPI_TYPE_ARRAY,
    OPENAPI_ITEMS,
)
from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol
from utils.naming import pascal_case, snake_case

Schema = dict[str, Any]

# Maximum nesting depth to prevent infinite recursion
MAX_NESTING_DEPTH = 10


@dataclass(frozen=True)
class NestedObjectPlan:
    """Plan for a nested object model."""

    schema_name: str
    class_name: str
    fields_class_name: str
    artifact_folder: Path
    model_path: Path
    fields_path: Path
    index_path: Path
    parent_class_name: str | None = None
    nesting_depth: int = 0
    is_empty: bool = False


def is_inline_object_schema(schema: Schema) -> bool:
    """Return true when schema is an inline object with properties."""
    return (
        schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_OBJECT
        and isinstance(schema.get(OPENAPI_PROPERTIES), dict)
        and bool(schema.get(OPENAPI_PROPERTIES))
    )


def is_empty_object_schema(schema: Schema) -> bool:
    """Return true when schema is an object with no properties."""
    return schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_OBJECT and not schema.get(OPENAPI_PROPERTIES)


def get_nested_class_name(
    schema: Schema,
    json_name: str,
    parent_class_name: str | None = None,
) -> str:
    """
    Generate a Dart class name for a nested object.

    Priority:
    1. x-codegen.name if present
    2. title if present
    3. parent_class_name + pascal_case(json_name)
    4. pascal_case(json_name)
    """
    # Check for x-codegen.name
    x_codegen = schema.get("x-codegen", {})
    if isinstance(x_codegen, dict) and x_codegen.get("name"):
        name = x_codegen["name"]
        return sanitize_class_name(name)

    # Check for title
    if schema.get("title"):
        name = schema["title"]
        return sanitize_class_name(name)

    # Derive from parent class name and field name
    if parent_class_name:
        name = f"{parent_class_name}{pascal_case(json_name)}"
    else:
        name = pascal_case(json_name)

    return sanitize_class_name(name)


def sanitize_class_name(name: str) -> str:
    """Sanitize a class name to be a valid Dart identifier."""
    # Handle empty name
    if not name:
        return "NestedObject"

    # Handle leading digits
    if name[0].isdigit():
        name = f"Value{name}"

    # Handle reserved words
    if name in DART_RESERVED_WORDS:
        name = f"{name}Value"

    return name


def get_nested_folder_name(class_name: str) -> str:
    """Generate a folder name for a nested class."""
    return snake_case(class_name)


def plan_nested_object(
    schema: Schema,
    json_name: str,
    parent_class_name: str,
    parent_artifact_folder: Path,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    schemas: dict[str, Schema] | None = None,
    nesting_depth: int = 0,
    visited_schemas: set[str] | None = None,
) -> NestedObjectPlan | None:
    """
    Plan a nested object model.

    Returns None if the object should be treated as dynamic (empty or too deep).
    """
    if visited_schemas is None:
        visited_schemas = set()

    # Check nesting depth limit
    if nesting_depth >= MAX_NESTING_DEPTH:
        print(f"Warning: Max nesting depth ({MAX_NESTING_DEPTH}) exceeded for {json_name} in {parent_class_name}")
        return None

    # Check for empty object
    if is_empty_object_schema(schema):
        return None

    # Check for recursive schema
    schema_id = f"{parent_class_name}.{json_name}"
    if schema_id in visited_schemas:
        print(f"Warning: Recursive nested object detected: {schema_id}")
        return None

    visited_schemas.add(schema_id)

    # Generate class name
    class_name = get_nested_class_name(schema, json_name, parent_class_name)
    fields_class_name = f"{class_name}Fields"

    # Generate folder path inside parent folder
    folder_name = get_nested_folder_name(class_name)
    artifact_folder = parent_artifact_folder / folder_name

    # Generate file paths
    model_path = artifact_folder / "model.dart"
    fields_path = artifact_folder / "fields.dart"
    index_path = artifact_folder / "index.dart"

    # Create or update symbol for the nested class (use class_name as schema_name to match field_plan)
    schema_name = class_name
    symbol_registry[schema_name] = DartSymbol(
        schema_name=schema_name,
        dart_name=class_name,
        kind=SchemaKind.MODEL,
        path=model_path,
    )

    return NestedObjectPlan(
        schema_name=schema_name,
        class_name=class_name,
        fields_class_name=fields_class_name,
        artifact_folder=artifact_folder,
        model_path=model_path,
        fields_path=fields_path,
        index_path=index_path,
        parent_class_name=parent_class_name,
        nesting_depth=nesting_depth,
        is_empty=False,
    )


def plan_nested_objects_recursively(
    properties: dict[str, Schema],
    parent_class_name: str,
    parent_artifact_folder: Path,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    schemas: dict[str, Schema] | None = None,
    nesting_depth: int = 0,
    visited_schemas: set[str] | None = None,
) -> list[NestedObjectPlan]:
    """
    Recursively plan all nested objects in a schema's properties.

    Returns a list of nested object plans in the order they are discovered.
    """
    nested_plans: list[NestedObjectPlan] = []

    for json_name, schema in properties.items():
        # Check for inline object
        if is_inline_object_schema(schema):
            plan = plan_nested_object(
                schema=schema,
                json_name=json_name,
                parent_class_name=parent_class_name,
                parent_artifact_folder=parent_artifact_folder,
                symbol_registry=symbol_registry,
                package_name=package_name,
                schemas=schemas,
                nesting_depth=nesting_depth,
                visited_schemas=visited_schemas,
            )

            if plan:
                nested_plans.append(plan)

                # Recursively plan nested objects within this nested object
                nested_properties = schema.get(OPENAPI_PROPERTIES, {})
                if nested_properties:
                    child_plans = plan_nested_objects_recursively(
                        properties=nested_properties,
                        parent_class_name=plan.class_name,
                        parent_artifact_folder=plan.artifact_folder,
                        symbol_registry=symbol_registry,
                        package_name=package_name,
                        schemas=schemas,
                        nesting_depth=nesting_depth + 1,
                        visited_schemas=visited_schemas,
                    )
                    nested_plans.extend(child_plans)

        # Check for array of inline objects
        elif schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_ARRAY:
            items = schema.get(OPENAPI_ITEMS)
            if isinstance(items, dict) and is_inline_object_schema(items):
                plan = plan_nested_object(
                    schema=items,
                    json_name=json_name,
                    parent_class_name=parent_class_name,
                    parent_artifact_folder=parent_artifact_folder,
                    symbol_registry=symbol_registry,
                    package_name=package_name,
                    schemas=schemas,
                    nesting_depth=nesting_depth,
                    visited_schemas=visited_schemas,
                )

                if plan:
                    nested_plans.append(plan)

                    # Recursively plan nested objects within array item
                    item_properties = items.get(OPENAPI_PROPERTIES, {})
                    if item_properties:
                        child_plans = plan_nested_objects_recursively(
                            properties=item_properties,
                            parent_class_name=plan.class_name,
                            parent_artifact_folder=plan.artifact_folder,
                            symbol_registry=symbol_registry,
                            package_name=package_name,
                            schemas=schemas,
                            nesting_depth=nesting_depth + 1,
                            visited_schemas=visited_schemas,
                        )
                        nested_plans.extend(child_plans)

    return nested_plans
