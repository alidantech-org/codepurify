"""
Dart type resolution from OpenAPI schemas.

This module answers: what Dart type represents this OpenAPI schema?

It converts OpenAPI types (string, integer, array, object) to Dart types
(String, int, List<T>, Map<String, dynamic>) with proper nullability handling.

This module is the main protection against accidental 'dynamic' types.

This module must not:
- decide required constructor fields
- generate class files
- generate import statements beyond resolved import metadata
- inspect operation paths
- render templates
- write files
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_LIST_TYPE_FORMAT,
    DART_MAP_STRING_TYPE_FORMAT,
    DART_MAP_TYPE_PREFIX,
    DART_NULLABLE_SUFFIX,
    format_package_import,
)
from constants.dart_types import (
    DART_BOOL,
    DART_DATE_TIME,
    DART_INT,
    DART_NUM,
    DART_OBJECT,
    DART_STRING,
)
from constants.json_types import JSON_STRING_DYNAMIC_MAP_TYPE
from constants.openapi_keys import (
    OPENAPI_ADDITIONAL_PROPERTIES,
    OPENAPI_ANY_OF,
    OPENAPI_FORMAT,
    OPENAPI_FORMAT_DATE,
    OPENAPI_FORMAT_DATE_TIME,
    OPENAPI_ITEMS,
    OPENAPI_NULLABLE,
    OPENAPI_ONE_OF,
    OPENAPI_PROPERTIES,
    OPENAPI_REF,
    OPENAPI_TYPE,
    OPENAPI_TYPE_ARRAY,
    OPENAPI_TYPE_BOOLEAN,
    OPENAPI_TYPE_INTEGER,
    OPENAPI_TYPE_NULL,
    OPENAPI_TYPE_NUMBER,
    OPENAPI_TYPE_OBJECT,
    OPENAPI_TYPE_STRING,
)
from ..domain.kinds import SchemaKind
from ..registry import DartSymbol
from .schema_normalizer import (
    is_scalar_like_schema,
    normalize_nullable_schema,
)

Schema = dict[str, Any]


@dataclass(frozen=True)
class DartResolvedType:
    """
    Resolved Dart type metadata.

    name:
        Full Dart type without nullable suffix.
        Examples: String, User, List<User>, Map<String, dynamic>

    base_name:
        Core Dart type name.
        For List<User>, base_name is User.
        For String, base_name is String.

    is_required:
        Whether the owning field/property is required by OpenAPI.

    is_optional:
        Whether the owning field/property may be missing.

    is_nullable:
        Whether generated Dart field should be nullable.

        In this generator, optional fields are nullable because missing JSON
        values must be representable safely in Dart.

    item_type:
        For List<T>, this stores the resolved T metadata.
    """

    name: str
    base_name: str
    is_required: bool
    is_optional: bool
    is_nullable: bool
    is_list: bool
    is_enum: bool
    is_model: bool
    is_primitive: bool
    import_uri: str | None
    item_type: DartResolvedType | None = None

    @property
    def dart_type(self) -> str:
        """Full Dart type including nullable suffix when needed."""
        return self.name

    @property
    def is_map(self) -> bool:
        """Return true when the resolved type is a Dart Map type."""
        return self.name.startswith(DART_MAP_TYPE_PREFIX)

    @property
    def needs_import(self) -> bool:
        """Return true when the resolved type requires a Dart import."""
        return self.import_uri is not None


def resolve_type(
    schema: Schema,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    required: bool = False,
    schemas: dict[str, Schema] | None = None,
    version_folder: str = "latest",
    parent_artifact_folder: Path | None = None,
) -> DartResolvedType:
    """
    Resolve an OpenAPI schema into Dart type metadata.

    `required` means the containing object lists this field in its OpenAPI
    `required` array.

    Optional fields are nullable in generated Dart because missing JSON values
    must be representable safely.

    parent_artifact_folder: If provided, nested classes will use relative imports
    instead of package imports.
    """
    normalized_schema, schema_nullable = normalize_nullable_schema(schema)

    ref = normalized_schema.get(OPENAPI_REF)
    if ref:
        return resolve_ref_type(
            schema_name=extract_ref_name(ref),
            symbol_registry=symbol_registry,
            package_name=package_name,
            required=required,
            schema_nullable=schema_nullable,
            schemas=schemas,
            version_folder=version_folder,
            parent_artifact_folder=parent_artifact_folder,
        )

    schema_type = normalized_schema.get(OPENAPI_TYPE)

    if schema_type == OPENAPI_TYPE_ARRAY:
        return resolve_array_type(
            schema=normalized_schema,
            symbol_registry=symbol_registry,
            package_name=package_name,
            required=required,
            schema_nullable=schema_nullable,
            schemas=schemas,
            version_folder=version_folder,
        )

    if schema_type == OPENAPI_TYPE_OBJECT:
        return resolve_object_type(
            schema=normalized_schema,
            symbol_registry=symbol_registry,
            package_name=package_name,
            required=required,
            schema_nullable=schema_nullable,
            schemas=schemas,
            version_folder=version_folder,
        )

    dart_type, is_primitive = resolve_primitive_type(
        schema_type=schema_type,
        schema_format=normalized_schema.get(OPENAPI_FORMAT),
    )

    return create_resolved_type(
        name=dart_type,
        base_name=dart_type,
        required=required,
        schema_nullable=schema_nullable,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=is_primitive,
        import_uri=None,
    )


def resolve_ref_type(
    schema_name: str,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    required: bool,
    schema_nullable: bool = False,
    schemas: dict[str, Schema] | None = None,
    version_folder: str = "latest",
    parent_artifact_folder: Path | None = None,
) -> DartResolvedType:
    """
    Resolve a $ref schema into Dart type metadata.

    Unknown refs fail loudly because silently falling back to Object/dynamic hides
    planning bugs.

    Property refs (x-codegen.kind: property) are only inlined if the referenced
    schema is scalar-like (primitive, enum, or array of primitives). Object-like
    property refs are treated as model refs to generate proper class plans.

    Scalar refs (PRIMITIVE_ALIAS) are inlined as primitive types to prevent
    them from leaking as Dart class types.

    parent_artifact_folder: If provided, nested classes will use relative imports
    instead of package imports.
    """
    symbol = symbol_registry.get(schema_name)

    if not symbol:
        raise ValueError(f"Unknown OpenAPI $ref '{schema_name}'. " "The schema must be planned and registered before type resolution.")

    # Check if this is a $ref to another schema (ref chain)
    # Follow the chain to find the actual schema
    if schemas and schema_name in schemas:
        ref_schema = schemas[schema_name]
        inner_ref = ref_schema.get(OPENAPI_REF)
        if inner_ref:
            # Recursively resolve the inner ref
            inner_schema_name = extract_ref_name(inner_ref)
            return resolve_ref_type(
                schema_name=inner_schema_name,
                symbol_registry=symbol_registry,
                package_name=package_name,
                required=required,
                schema_nullable=schema_nullable,
                schemas=schemas,
                version_folder=version_folder,
            )

    # If this is a PRIMITIVE_ALIAS ref, inline it as a primitive type
    # This prevents scalar refs from leaking as Dart class types
    if symbol.kind == SchemaKind.PRIMITIVE_ALIAS:
        if schemas and schema_name in schemas:
            ref_schema = schemas[schema_name]
            # Recursively resolve the primitive schema's actual type
            return resolve_type(
                schema=ref_schema,
                symbol_registry=symbol_registry,
                package_name=package_name,
                required=required,
                schemas=schemas,
                version_folder=version_folder,
            )
        # Fallback: use the dart_name from the symbol (should be primitive type)
        return create_resolved_type(
            name=symbol.dart_name,
            base_name=symbol.dart_name,
            required=required,
            schema_nullable=schema_nullable,
            is_list=False,
            is_enum=False,
            is_model=False,
            is_primitive=True,
            import_uri=None,
        )

    # If this is a property ref (kind: property), check schema shape before inlining
    if schemas and schema_name in schemas:
        from openapi.codegen_metadata import read_codegen_metadata

        ref_schema = schemas[schema_name]
        meta = read_codegen_metadata(ref_schema)

        # If this is a property schema, check if it's scalar-like before inlining
        if meta.kind == "property":
            # Only inline scalar-like schemas (primitives, enums, arrays of primitives)
            # Object-like property refs should be treated as model refs
            if is_scalar_like_schema(ref_schema):
                # Recursively resolve the property schema's actual type
                return resolve_type(
                    schema=ref_schema,
                    symbol_registry=symbol_registry,
                    package_name=package_name,
                    required=required,
                    schemas=schemas,
                    version_folder=version_folder,
                )
            # If object-like, fall through to treat as model ref below

    is_enum = symbol.kind == SchemaKind.ENUM
    is_model = symbol.kind in {SchemaKind.MODEL, SchemaKind.DTO}
    is_primitive_alias = symbol.kind == SchemaKind.PRIMITIVE_ALIAS

    import_uri = None
    if symbol.path and not is_primitive_alias:
        # Use index.dart barrel for imports when available
        if symbol.path.name == "enum.dart":
            import_path = symbol.path.parent / "index.dart"
        else:
            import_path = symbol.path.parent / "index.dart"

        # Check if this is a nested class - use relative import if parent folder is provided
        if parent_artifact_folder and symbol.path.is_relative_to(parent_artifact_folder):
            # Generate relative import for nested class
            # e.g., from parent: import 'user_settings_channels/model.dart'
            relative_path = symbol.path.relative_to(parent_artifact_folder.parent)
            import_uri = relative_path.as_posix()
        else:
            # Include version folder in import path for package imports
            import_uri = format_package_import(
                package_name,
                f"{version_folder}/{import_path.as_posix()}",
            )

    return create_resolved_type(
        name=symbol.dart_name,
        base_name=symbol.dart_name,
        required=required,
        schema_nullable=schema_nullable,
        is_list=False,
        is_enum=is_enum,
        is_model=is_model,
        is_primitive=is_primitive_alias,
        import_uri=import_uri,
    )


def resolve_array_type(
    schema: Schema,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    required: bool,
    schema_nullable: bool = False,
    schemas: dict[str, Schema] | None = None,
    version_folder: str = "latest",
) -> DartResolvedType:
    """
    Resolve an OpenAPI array schema into List<T>.

    The item type is preserved so JSON expression builders can safely know
    whether list items are enum/model/primitive.
    """
    items = schema.get(OPENAPI_ITEMS)

    if isinstance(items, dict):
        # Resolve item type with its own nullable state from the items schema
        # Items are required by default in the array context
        # but the items schema itself can be nullable (e.g., anyOf with null)
        item_type = resolve_type(
            schema=items,
            symbol_registry=symbol_registry,
            package_name=package_name,
            required=True,  # Items are required in array context
            schemas=schemas,
            version_folder=version_folder,
        )
    else:
        item_type = create_resolved_type(
            name=DART_OBJECT,
            base_name=DART_OBJECT,
            required=True,
            schema_nullable=False,
            is_list=False,
            is_enum=False,
            is_model=False,
            is_primitive=False,
            import_uri=None,
        )

    list_name = DART_LIST_TYPE_FORMAT.format(item_type.name)

    return create_resolved_type(
        name=list_name,
        base_name=item_type.base_name,
        required=required,
        schema_nullable=schema_nullable,
        is_list=True,
        is_enum=item_type.is_enum,
        is_model=item_type.is_model,
        is_primitive=item_type.is_primitive,
        import_uri=item_type.import_uri,
        item_type=item_type,
    )


def resolve_object_type(
    schema: Schema,
    symbol_registry: dict[str, DartSymbol],
    package_name: str,
    required: bool,
    schema_nullable: bool = False,
    schemas: dict[str, Schema] | None = None,
    version_folder: str = "latest",
) -> DartResolvedType:
    """
    Resolve an OpenAPI object schema.

    Structured objects with properties should normally be planned as model/DTO
    symbols before this resolver runs.

    Free-form objects and additionalProperties maps are allowed.
    """
    properties = schema.get(OPENAPI_PROPERTIES)

    if isinstance(properties, dict) and properties:
        raise ValueError(
            "Inline object schema with properties reached type resolution. "
            "It should be planned as a model/DTO before resolving Dart types."
        )

    additional_properties = schema.get(OPENAPI_ADDITIONAL_PROPERTIES)

    if isinstance(additional_properties, dict):
        value_type = resolve_type(
            schema=additional_properties,
            symbol_registry=symbol_registry,
            package_name=package_name,
            required=True,
            schemas=schemas,
            version_folder=version_folder,
        )

        map_type = DART_MAP_STRING_TYPE_FORMAT.format(value_type.name)

        return create_resolved_type(
            name=map_type,
            base_name=map_type,
            required=required,
            schema_nullable=schema_nullable,
            is_list=False,
            is_enum=False,
            is_model=False,
            is_primitive=False,
            import_uri=value_type.import_uri,
        )

    return create_resolved_type(
        name=JSON_STRING_DYNAMIC_MAP_TYPE,
        base_name=JSON_STRING_DYNAMIC_MAP_TYPE,
        required=required,
        schema_nullable=schema_nullable,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=False,
        import_uri=None,
    )


def resolve_primitive_type(
    schema_type: str | None,
    schema_format: str | None,
) -> tuple[str, bool]:
    """
    Resolve primitive OpenAPI type/format into Dart type.

    Unknown primitives return Object, not dynamic, to avoid unsafe generated code.
    """
    if schema_type == OPENAPI_TYPE_STRING:
        if schema_format in {OPENAPI_FORMAT_DATE_TIME, OPENAPI_FORMAT_DATE}:
            return DART_DATE_TIME, True

        return DART_STRING, True

    if schema_type == OPENAPI_TYPE_INTEGER:
        return DART_INT, True

    if schema_type == OPENAPI_TYPE_NUMBER:
        return DART_NUM, True

    if schema_type == OPENAPI_TYPE_BOOLEAN:
        return DART_BOOL, True

    return DART_OBJECT, False


def create_resolved_type(
    name: str,
    base_name: str,
    required: bool,
    schema_nullable: bool,
    is_list: bool,
    is_enum: bool,
    is_model: bool,
    is_primitive: bool,
    import_uri: str | None,
    item_type: DartResolvedType | None = None,
) -> DartResolvedType:
    """Create a DartResolvedType with consistent nullability rules."""
    is_optional = not required
    is_nullable = is_optional or schema_nullable

    # Add nullable suffix to name when nullable
    final_name = f"{name}{DART_NULLABLE_SUFFIX}" if is_nullable else name

    return DartResolvedType(
        name=final_name,
        base_name=base_name,
        is_required=required,
        is_optional=is_optional,
        is_nullable=is_nullable,
        is_list=is_list,
        is_enum=is_enum,
        is_model=is_model,
        is_primitive=is_primitive,
        import_uri=import_uri,
        item_type=item_type,
    )


def extract_ref_name(ref: str) -> str:
    """Extract schema name from an OpenAPI $ref string."""
    return ref.rsplit("/", 1)[-1]


def is_nullable_schema_type(schema: Schema) -> bool:
    """
    Check if a schema explicitly allows null.

    Kept for callers/tests. resolve_type itself relies on normalize_nullable_schema().
    """
    any_of = schema.get(OPENAPI_ANY_OF)
    if isinstance(any_of, list):
        return any(is_null_schema(item) for item in any_of)

    one_of = schema.get(OPENAPI_ONE_OF)
    if isinstance(one_of, list):
        return any(is_null_schema(item) for item in one_of)

    return bool(schema.get(OPENAPI_NULLABLE, False))


def is_null_schema(value: Any) -> bool:
    """Return true when a value is an OpenAPI null schema."""
    return isinstance(value, dict) and value.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL
