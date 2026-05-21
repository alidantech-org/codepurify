"""
Dart JSON expression builders for serialization/deserialization.

This module provides functions that build Dart code strings for JSON serialization
and deserialization from resolved type plans.

This module must not:
- perform type resolution
- build generation plans
- render templates
- write files
"""

from constants.dart_syntax import (
    DART_BOOL_TYPE,
    DART_DATETIME_TYPE,
    DART_DOUBLE_TYPE,
    DART_ENUM_VALUE_PROPERTY,
    DART_EXPR_FIELD_ACCESS,
    DART_EXPR_FROM_JSON_FIELD_VALUE,
    DART_EXPR_ITEM_METHOD_CALL,
    DART_EXPR_ITEM_PROPERTY,
    DART_EXPR_LIST_OR_EMPTY,
    DART_EXPR_MAP_CALL,
    DART_EXPR_METHOD_CALL,
    DART_EXPR_NULLABLE_BOOL_FROM_JSON,
    DART_EXPR_NULLABLE_DATETIME_FROM_JSON,
    DART_EXPR_NULLABLE_METHOD_CALL,
    DART_EXPR_NULLABLE_STRING_FROM_JSON,
    DART_EXPR_NULLABLE_VALUE,
    DART_EXPR_NULLABLE_MAP_CALL,
    DART_EXPR_REQUIRED_BOOL_FROM_JSON,
    DART_EXPR_REQUIRED_DATETIME_FROM_JSON,
    DART_EXPR_REQUIRED_STRING_FROM_JSON,
    DART_EXPR_TO_ISO_8601,
    DART_INT_TYPE,
    DART_JSON_MAP_VAR,
    DART_LAMBDA_ITEM_VAR,
    DART_NUM_TYPE,
    DART_STRING_TYPE,
    DART_TO_ISO_8601_STRING,
    DART_TO_JSON_METHOD,
)
from ..type_system.resolver import DartResolvedType


def build_json_field_value_expr(
    dart_name: str,
    fields_class_name: str,
) -> str:
    """Build a JSON map lookup using generated field constants."""
    return DART_EXPR_FROM_JSON_FIELD_VALUE.format(
        DART_JSON_MAP_VAR,
        fields_class_name,
        dart_name,
    )


def build_item_property_expr(property_name: str) -> str:
    """Build a lambda item property access expression."""
    return DART_EXPR_ITEM_PROPERTY.format(DART_LAMBDA_ITEM_VAR, property_name)


def build_item_method_expr(method_name: str) -> str:
    """Build a lambda item method call expression."""
    return DART_EXPR_ITEM_METHOD_CALL.format(DART_LAMBDA_ITEM_VAR, method_name)


def build_nullable_value_expr(value: str, property_name: str) -> str:
    """Build nullable property access expression."""
    return DART_EXPR_NULLABLE_VALUE.format(value, property_name)


def build_safe_string_expr(value: str, fallback: str = '""') -> str:
    """Build a safe String expression."""
    return f"{value}?.toString() ?? {fallback}"


def build_safe_map_expr(value: str) -> str:
    """Build a safe Map<String, dynamic> expression."""
    return f"Map<String, dynamic>.from(({value} as Map?) ?? {{}})"


def build_required_enum_expr(enum_name: str, value: str) -> str:
    """Build safe required enum parse expression."""
    return f"{enum_name}.fromValue({build_safe_string_expr(value)})"


def build_nullable_enum_expr(enum_name: str, value: str) -> str:
    """Build safe nullable enum parse expression."""
    return f"{value} == null ? null : {enum_name}.fromValue({value}.toString())"


def build_required_int_expr(value: str) -> str:
    """Build safe required int parse expression."""
    return f"{value} is int ? {value} : int.tryParse({build_safe_string_expr(value)}) ?? 0"


def build_nullable_int_expr(value: str) -> str:
    """Build safe nullable int parse expression."""
    return f"{value} == null ? null : ({value} is int ? {value} : int.tryParse({value}.toString()))"


def build_required_double_expr(value: str) -> str:
    """Build safe required double parse expression."""
    return f"{value} is double ? {value} : double.tryParse({build_safe_string_expr(value)}) ?? 0.0"


def build_nullable_double_expr(value: str) -> str:
    """Build safe nullable double parse expression."""
    return f"{value} == null ? null : ({value} is double ? {value} : double.tryParse({value}.toString()))"


def build_required_num_expr(value: str) -> str:
    """Build safe required num parse expression."""
    return f"{value} is num ? {value} : num.tryParse({build_safe_string_expr(value)}) ?? 0"


def build_nullable_num_expr(value: str) -> str:
    """Build safe nullable num parse expression."""
    return f"{value} == null ? null : ({value} is num ? {value} : num.tryParse({value}.toString()))"


def build_from_json_expr(
    dart_name: str,
    json_name: str,
    fields_class_name: str,
    resolved_type: DartResolvedType,
) -> str:
    """
    Build Dart fromJson field expression.

    Uses generated field constants:

        map[UserFields.id]

    not hard-coded JSON strings.
    """
    _ = json_name

    value = build_json_field_value_expr(
        dart_name=dart_name,
        fields_class_name=fields_class_name,
    )

    if resolved_type.is_list:
        return build_list_from_json_expr(value, resolved_type)

    if resolved_type.is_model:
        return build_model_from_json_expr(value, resolved_type)

    if resolved_type.is_enum:
        return build_enum_from_json_expr(value, resolved_type)

    if resolved_type.base_name == DART_DATETIME_TYPE:
        return build_datetime_from_json_expr(value, resolved_type)

    return build_primitive_from_json_expr(value, resolved_type)


def build_list_from_json_expr(
    value: str,
    resolved_type: DartResolvedType,
) -> str:
    """Build Dart expression for reading a list from JSON."""
    list_value = DART_EXPR_LIST_OR_EMPTY.format(value)
    item_type = resolved_type.item_type

    if item_type is None:
        return list_value

    if item_type.is_enum:
        enum_expr = build_required_enum_expr(
            enum_name=item_type.base_name,
            value=DART_LAMBDA_ITEM_VAR,
        )

        return DART_EXPR_MAP_CALL.format(
            list_value,
            DART_LAMBDA_ITEM_VAR,
            enum_expr,
        )

    if item_type.is_model:
        model_expr = f"{item_type.base_name}.fromJson({build_safe_map_expr(DART_LAMBDA_ITEM_VAR)})"

        return DART_EXPR_MAP_CALL.format(
            list_value,
            DART_LAMBDA_ITEM_VAR,
            model_expr,
        )

    return list_value


def build_model_from_json_expr(
    value: str,
    resolved_type: DartResolvedType,
) -> str:
    """Build Dart expression for reading a model object from JSON."""
    model_expr = f"{resolved_type.base_name}.fromJson({build_safe_map_expr(value)})"

    if resolved_type.is_nullable:
        return f"{value} == null ? null : {model_expr}"

    return model_expr


def build_enum_from_json_expr(
    value: str,
    resolved_type: DartResolvedType,
) -> str:
    """
    Build Dart expression for reading an enum from JSON.

    Required enums use a safe String fallback.
    Nullable enums return null safely before calling fromValue.
    """
    if resolved_type.is_nullable:
        return build_nullable_enum_expr(
            enum_name=resolved_type.base_name,
            value=value,
        )

    return build_required_enum_expr(
        enum_name=resolved_type.base_name,
        value=value,
    )


def build_datetime_from_json_expr(
    value: str,
    resolved_type: DartResolvedType,
) -> str:
    """Build Dart expression for reading a DateTime from JSON."""
    if resolved_type.is_nullable:
        return DART_EXPR_NULLABLE_DATETIME_FROM_JSON.format(value)

    return DART_EXPR_REQUIRED_DATETIME_FROM_JSON.format(value)


def build_primitive_from_json_expr(
    value: str,
    resolved_type: DartResolvedType,
) -> str:
    """Build Dart expression for reading a primitive value from JSON."""
    if resolved_type.base_name == DART_STRING_TYPE:
        if resolved_type.is_nullable:
            return DART_EXPR_NULLABLE_STRING_FROM_JSON.format(value)

        return DART_EXPR_REQUIRED_STRING_FROM_JSON.format(value)

    if resolved_type.base_name == DART_BOOL_TYPE:
        if resolved_type.is_nullable:
            return DART_EXPR_NULLABLE_BOOL_FROM_JSON.format(value)

        return DART_EXPR_REQUIRED_BOOL_FROM_JSON.format(value)

    if resolved_type.base_name == DART_INT_TYPE:
        if resolved_type.is_nullable:
            return build_nullable_int_expr(value)

        return build_required_int_expr(value)

    if resolved_type.base_name == DART_DOUBLE_TYPE:
        if resolved_type.is_nullable:
            return build_nullable_double_expr(value)

        return build_required_double_expr(value)

    if resolved_type.base_name == DART_NUM_TYPE:
        if resolved_type.is_nullable:
            return build_nullable_num_expr(value)

        return build_required_num_expr(value)

    return value


def build_to_json_expr(
    dart_name: str,
    json_name: str,
    required: bool,
    resolved_type: DartResolvedType,
) -> str:
    """
    Build Dart toJson field expression.

    The template should use generated field constants as the JSON map keys.
    """
    _ = json_name
    _ = required

    if resolved_type.is_list:
        return build_list_to_json_expr(dart_name, resolved_type)

    if resolved_type.is_model:
        if resolved_type.is_nullable:
            return DART_EXPR_NULLABLE_METHOD_CALL.format(
                dart_name,
                DART_TO_JSON_METHOD,
            )

        return DART_EXPR_METHOD_CALL.format(
            dart_name,
            DART_TO_JSON_METHOD,
        )

    if resolved_type.is_enum:
        if resolved_type.is_nullable:
            return build_nullable_value_expr(
                value=dart_name,
                property_name=DART_ENUM_VALUE_PROPERTY,
            )

        return DART_EXPR_FIELD_ACCESS.format(
            dart_name,
            DART_ENUM_VALUE_PROPERTY,
        )

    if resolved_type.base_name == DART_DATETIME_TYPE:
        if resolved_type.is_nullable:
            return DART_EXPR_NULLABLE_METHOD_CALL.format(
                dart_name,
                DART_TO_ISO_8601_STRING,
            )

        return DART_EXPR_TO_ISO_8601.format(dart_name)

    return dart_name


def build_list_to_json_expr(
    dart_name: str,
    resolved_type: DartResolvedType,
) -> str:
    """Build Dart expression for writing a list to JSON."""
    item_type = resolved_type.item_type

    if item_type is None:
        return dart_name

    source = f"{dart_name}?" if resolved_type.is_nullable else dart_name
    map_call = DART_EXPR_NULLABLE_MAP_CALL if resolved_type.is_nullable else DART_EXPR_MAP_CALL

    if item_type.is_enum:
        item_expr = build_item_property_expr(DART_ENUM_VALUE_PROPERTY)

        return map_call.format(
            source,
            DART_LAMBDA_ITEM_VAR,
            item_expr,
        )

    if item_type.is_model:
        item_expr = build_item_method_expr(DART_TO_JSON_METHOD)

        return map_call.format(
            source,
            DART_LAMBDA_ITEM_VAR,
            item_expr,
        )

    return dart_name
