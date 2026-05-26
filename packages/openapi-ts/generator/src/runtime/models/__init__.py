"""Runtime input and output contracts.

These models define the public runtime interface used by CLI, tests, UI, API
servers, and other adapters.
"""

from runtime.models.diagnostics import RuntimeDiagnostic
from runtime.models.events import ProgressSink, RuntimeEvent
from runtime.models.inputs import EmitInput, InferInput, InspectInput, ValidateInput
from runtime.models.outputs import (
    AliasSchemaSummary,
    EmitOutput,
    InferOutput,
    InspectOutput,
    ResourceSummary,
    UnknownSchemaSummary,
    ValidateOutput,
)

__all__ = [
    "EmitInput",
    "InferInput",
    "InspectInput",
    "ValidateInput",
    "EmitOutput",
    "InferOutput",
    "InspectOutput",
    "ValidateOutput",
    "ResourceSummary",
    "UnknownSchemaSummary",
    "AliasSchemaSummary",
    "RuntimeDiagnostic",
    "RuntimeEvent",
    "ProgressSink",
]
