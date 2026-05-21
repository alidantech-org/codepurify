"""CLI option dataclasses."""

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class CommonOptions:
    """Common CLI options shared across commands."""
    input: Path
    dry_run: bool
    debug: bool


@dataclass(frozen=True)
class OutputOptions:
    """Output path options."""
    dart_output: Path
    docs_output: Path
    package_name: str


@dataclass(frozen=True)
class GenerateModeOptions:
    """Generation mode options."""
    no_docs: bool
    no_dart: bool
    only_docs: bool
    only_dart: bool
    only_enums: bool
    only_fields: bool
    only_classes: bool


@dataclass(frozen=True)
class GenerateOptions:
    """Generate command options."""
    common: CommonOptions
    output: OutputOptions
    mode: GenerateModeOptions
    clean: bool
    format: bool
    strict_format: bool
    tooling: bool
    force_tooling: bool
    interactive: bool


@dataclass(frozen=True)
class DocsOptions:
    """Docs command options."""
    common: CommonOptions
    output: Path
    clean: bool


@dataclass(frozen=True)
class InspectOptions:
    """Inspect command options."""
    common: CommonOptions
    output: OutputOptions
