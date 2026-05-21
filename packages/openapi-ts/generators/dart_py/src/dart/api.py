"""
Public Dart generator API.

CLI handlers should call this module instead of importing planning/rendering
internals directly.
"""

from config import GeneratorConfig
from .generation import generate_dart_sdk

__all__ = ["generate_dart_sdk", "GeneratorConfig"]
