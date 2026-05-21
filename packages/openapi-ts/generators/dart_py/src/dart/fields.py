"""
Field naming utilities for Dart SDK generation.

This module provides functions for converting JSON field names to valid Dart
field names, handling reserved words and naming conventions.

This module must not:
- perform type resolution
- build generation plans
- render templates
- decide full class structure
"""

from typing import Any

from constants.dart_keywords import DART_RESERVED_WORDS
from utils.naming import camel_case

Schema = dict[str, Any]


def to_dart_name(name: str) -> str:
    dart_name = camel_case(name)

    if not dart_name:
        return "value"

    if dart_name[0].isdigit():
        dart_name = f"value{dart_name[:1].upper()}{dart_name[1:]}"

    if dart_name in DART_RESERVED_WORDS:
        return f"{dart_name}Value"

    return dart_name
