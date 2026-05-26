"""
Runtime orchestration package.

This package provides the GeneratorApp class that orchestrates the full generator
pipeline: loading OpenAPI documents, running inference, creating emission plans,
and writing files. It bridges CLI commands with the core generator logic.
"""

from app.app import GeneratorApp
from app.models import (
    EmitInput,
    EmitOutput,
    InferInput,
    InferOutput,
    InspectInput,
    InspectOutput,
    ValidateInput,
    ValidateOutput,
)

__all__ = [
    "GeneratorApp",
    "EmitInput",
    "EmitOutput",
    "InferInput",
    "InferOutput",
    "InspectInput",
    "InspectOutput",
    "ValidateInput",
    "ValidateOutput",
]
