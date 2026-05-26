"""Runtime input contracts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from runtime.models.events import ProgressSink


@dataclass(frozen=True)
class InspectInput:
    """Input for inspecting an OpenAPI document."""

    input_path: Path
    progress: ProgressSink | None = None


@dataclass(frozen=True)
class ValidateInput:
    """Input for validating an OpenAPI document."""

    input_path: Path
    progress: ProgressSink | None = None


@dataclass(frozen=True)
class InferInput:
    """Input for OpenAPI inference."""

    input_path: Path
    output_path: Path | None = None
    progress: ProgressSink | None = None


@dataclass(frozen=True)
class EmitInput:
    """Input for emitting generated output."""

    input_path: Path
    language: str
    output_path: Path
    dry_run: bool = False
    templates_path: Path | None = None
    progress: ProgressSink | None = None
