"""
Dart type name constants.

This module contains immutable constants for Dart type names
used throughout the generator.
"""

DART_STRING = "String"
DART_INT = "int"
DART_NUM = "num"
DART_DOUBLE = "double"
DART_BOOL = "bool"
DART_DATE_TIME = "DateTime"
DART_OBJECT = "Object"
DART_DYNAMIC = "dynamic"
DART_VOID = "void"

DART_CORE_TYPES = frozenset({
    DART_STRING,
    DART_INT,
    DART_NUM,
    DART_DOUBLE,
    DART_BOOL,
    DART_DATE_TIME,
    DART_OBJECT,
    DART_DYNAMIC,
})
