"""Tests for Batch 2: model emission completeness and inline enum extraction."""

from pathlib import Path

from dart.classify.schemas import classify_schema
from dart.domain.kinds import SchemaKind
from dart.planning.inline_enum_extractor import (
    extract_inline_enums_from_schema,
    replace_inline_enum_with_ref,
)
from dart.planning.plan_registry.builder import build_dart_plans
from dart.registry import DartSymbol
from dart.type_system.resolver import resolve_ref_type


def test_model_schema_emits_under_models():
    """Test that MODEL schemas emit under models/."""
    schemas = {
        "VehicleModel": {
            "x-codegen": {"resource": "vehicle"},
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "name": {"type": "string"},
            },
        },
    }

    plan = build_dart_plans(
        spec={"components": {"schemas": schemas}},
        package_name="test_package",
    )

    # VehicleModel should be in class plans
    assert "VehicleModel" in plan.classes
    # Check that it's under models/vehicle/ (with resource metadata)
    assert "vehicle" in str(plan.classes["VehicleModel"].artifact_folder)


def test_query_schema_emits_under_models_query():
    """Test that QUERY schemas emit under models/{resource}/query/."""
    schemas = {
        "VehicleQuerySortValue": {
            "x-codegen": {"kind": "enum", "resource": "vehicle"},
            "type": "string",
            "enum": ["+numberPlate", "-numberPlate"],
        },
        "VehicleQuerySort": {
            "x-codegen": {"kind": "query", "resource": "vehicle"},
            "type": "object",
            "properties": {
                "sort": {"$ref": "#/components/schemas/VehicleQuerySortValue"},
            },
        },
    }

    plan = build_dart_plans(
        spec={"components": {"schemas": schemas}},
        package_name="test_package",
    )

    # VehicleQuerySort should be in class plans
    assert "VehicleQuerySort" in plan.classes
    # VehicleQuerySortValue should be in enum plans
    assert "VehicleQuerySortValue" in plan.enums
    # Check that query is under models/vehicle/query/ (with resource metadata)
    assert "vehicle" in str(plan.classes["VehicleQuerySort"].artifact_folder)
    assert "query" in str(plan.classes["VehicleQuerySort"].artifact_folder)
    # Check that enum is under models/vehicle/enums/
    assert "vehicle" in str(plan.enums["VehicleQuerySortValue"].output_path)
    assert "enums" in str(plan.enums["VehicleQuerySortValue"].output_path)


def test_inline_enum_extraction_from_property():
    """Test that inline enums in properties are extracted."""
    schema = {
        "type": "object",
        "properties": {
            "sort": {
                "type": "string",
                "enum": ["+numberPlate", "-numberPlate"],
            },
        },
    }

    extractions = extract_inline_enums_from_schema(
        schema_name="VehicleQuerySort",
        schema=schema,
        owner_class_name="VehicleQuerySort",
        resource_domain="vehicle",
        package_name="test_package",
    )

    assert len(extractions) == 1
    assert extractions[0].enum_name == "VehicleQuerySortSortValue"
    assert extractions[0].schema_name == "VehicleQuerySortSortValue"
    assert len(extractions[0].enum_plan.values) == 2
    assert extractions[0].enum_plan.values[0].wire_value == "+numberPlate"
    assert extractions[0].enum_plan.values[0].dart_name == "plusNumberPlate"
    assert extractions[0].enum_plan.values[1].wire_value == "-numberPlate"
    assert extractions[0].enum_plan.values[1].dart_name == "minusNumberPlate"


def test_inline_enum_extraction_from_array_items():
    """Test that inline enums in array items are extracted."""
    schema = {
        "type": "object",
        "properties": {
            "select": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["name", "photo"],
                },
            },
        },
    }

    extractions = extract_inline_enums_from_schema(
        schema_name="VehicleQuerySelect",
        schema=schema,
        owner_class_name="VehicleQuerySelect",
        resource_domain="vehicle",
        package_name="test_package",
    )

    assert len(extractions) == 1
    assert extractions[0].enum_name == "VehicleQuerySelectSelectValue"
    assert extractions[0].schema_name == "VehicleQuerySelectSelectValue"
    assert len(extractions[0].enum_plan.values) == 2
    assert extractions[0].enum_plan.values[0].wire_value == "name"
    assert extractions[0].enum_plan.values[0].dart_name == "name"
    assert extractions[0].enum_plan.values[1].wire_value == "photo"
    assert extractions[0].enum_plan.values[1].dart_name == "photo"


def test_inline_enum_replaced_with_ref():
    """Test that inline enums are replaced with $ref after extraction."""
    schema = {
        "type": "string",
        "enum": ["+numberPlate", "-numberPlate"],
    }

    symbol = DartSymbol(
        schema_name="VehicleQuerySortSortValue",
        dart_name="VehicleQuerySortSortValue",
        kind=SchemaKind.ENUM,
        path=Path("models/vehicle/enums/vehicle_query_sort_sort_value/enum.dart"),
    )

    ref_schema = replace_inline_enum_with_ref(schema, symbol)

    assert "$ref" in ref_schema
    assert ref_schema["$ref"] == "#/components/schemas/VehicleQuerySortSortValue"
    assert "enum" not in ref_schema


def test_scalar_ref_inlined_as_primitive():
    """Test that scalar refs are inlined as primitive types."""
    schemas = {
        "VehicleName": {
            "type": "string",
        },
    }

    symbol_registry = {
        "VehicleName": DartSymbol(
            schema_name="VehicleName",
            dart_name="String",
            kind=SchemaKind.PRIMITIVE_ALIAS,
            path=None,
        ),
    }

    resolved = resolve_ref_type(
        schema_name="VehicleName",
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    # Should resolve to String, not VehicleName
    assert resolved.name == "String"
    assert resolved.is_primitive is True
    assert resolved.is_model is False
    assert resolved.import_uri is None


def test_enum_schema_classification():
    """Test that enum schemas are classified as ENUM regardless of metadata."""
    schema = {
        "type": "string",
        "enum": ["active", "inactive"],
    }

    kind = classify_schema("UserStatus", schema)
    assert kind == SchemaKind.ENUM


def test_object_schema_classification():
    """Test that object schemas are classified as MODEL/DTO regardless of metadata."""
    schema = {
        "type": "object",
        "properties": {
            "id": {"type": "string"},
        },
    }

    kind = classify_schema("UserModel", schema)
    assert kind == SchemaKind.MODEL


def test_enum_value_naming_with_symbols():
    """Test that enum values with symbols are converted to valid Dart identifiers."""
    schema = {
        "type": "object",
        "properties": {
            "sort": {
                "type": "string",
                "enum": ["+numberPlate", "-numberPlate", "name"],
            },
        },
    }

    extractions = extract_inline_enums_from_schema(
        schema_name="VehicleQuerySort",
        schema=schema,
        owner_class_name="VehicleQuerySort",
        resource_domain="vehicle",
        package_name="test_package",
    )

    assert len(extractions) == 1
    values = extractions[0].enum_plan.values

    # Check that symbols are converted to valid Dart identifiers
    assert values[0].dart_name == "plusNumberPlate"
    assert values[1].dart_name == "minusNumberPlate"
    assert values[2].dart_name == "name"


def test_allOf_inheritance_preserved_for_query_models():
    """Test that allOf inheritance is preserved for query models."""
    schemas = {
        "BaseQuerySort": {
            "type": "object",
            "properties": {
                "field": {"type": "string"},
            },
        },
        "VehicleQuerySort": {
            "x-codegen": {"kind": "query", "resource": "vehicle"},
            "allOf": [
                {"$ref": "#/components/schemas/BaseQuerySort"},
                {
                    "type": "object",
                    "properties": {
                        "direction": {"type": "string"},
                    },
                },
            ],
        },
    }

    plan = build_dart_plans(
        spec={"components": {"schemas": schemas}},
        package_name="test_package",
    )

    # VehicleQuerySort should have base class
    assert "VehicleQuerySort" in plan.classes
    assert plan.classes["VehicleQuerySort"].base_class_name == "BaseQuerySort"
    assert plan.classes["VehicleQuerySort"].base_schema_name == "BaseQuerySort"


def test_inline_enum_path_under_models_enums():
    """Test that inline enums are placed under models/{resource}/enums/."""
    schema = {
        "type": "object",
        "properties": {
            "sort": {
                "type": "string",
                "enum": ["+numberPlate", "-numberPlate"],
            },
        },
    }

    extractions = extract_inline_enums_from_schema(
        schema_name="VehicleQuerySort",
        schema=schema,
        owner_class_name="VehicleQuerySort",
        resource_domain="vehicle",
        package_name="test_package",
    )

    assert len(extractions) == 1
    # Path should be under models/vehicle/enums/
    assert "enums" in str(extractions[0].symbol.path)
    assert "vehicle" in str(extractions[0].symbol.path)


def test_inline_enum_extractor_skips_ref_properties():
    """Test that inline enum extractor skips properties that are already $ref to enum components."""
    schema = {
        "type": "object",
        "properties": {
            "sort": {
                "$ref": "#/components/schemas/VehicleQuerySortValue",
            },
            "select": {
                "type": "array",
                "items": {
                    "$ref": "#/components/schemas/VehicleQuerySelectValue",
                },
            },
        },
    }

    extractions = extract_inline_enums_from_schema(
        schema_name="VehicleQuerySort",
        schema=schema,
        owner_class_name="VehicleQuerySort",
        resource_domain="vehicle",
        package_name="test_package",
    )

    # Should not extract any inline enums since properties are already $refs
    assert len(extractions) == 0
