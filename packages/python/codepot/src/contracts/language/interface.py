"""Language adapter interface contract.

This module defines the exact methods every Codepotx language adapter must
implement. The pipeline calls adapters through this interface only.

Language adapters should:
- create global language runtime context
- enrich selected spec/template items with `.lang`
- create type annotations
- create file-level imports
- create file-level exports

Language adapters should not:
- load specs
- select records
- plan files
- render templates
- write files
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from contracts.language.context import (
    LanguageField,
    LanguageItem,
    LanguageOperation,
    LanguageRoute,
)
from contracts.language.exports import LanguageExport
from contracts.language.imports import LanguageImport
from contracts.language.runtime import LanguageRuntime
from contracts.language.types import LanguageType
from contracts.spec.records import SpecRecord


@dataclass(frozen=True)
class LanguageRuntimeRequest:
    """Request used to create global language runtime context."""

    language: str
    extension: str
    package_name: str | None
    package_manager: str | None
    source_root: Path
    naming: object
    imports: object


@dataclass(frozen=True)
class LanguageTypeRequest:
    """Request used to create one language type annotation."""

    source: object
    is_required: bool = False
    is_nullable: bool = False
    is_array: bool = False
    is_dynamic: bool = False
    is_void: bool = False


@dataclass(frozen=True)
class LanguageImportTarget:
    """One dependency target used to create imports for a file."""

    symbol: str
    target_path: Path
    source_path: Path
    is_type_only: bool = False
    alias: str | None = None


@dataclass(frozen=True)
class LanguageImportRequest:
    """Request used to create file-level imports."""

    source_path: Path
    targets: tuple[LanguageImportTarget, ...]
    runtime: LanguageRuntime


@dataclass(frozen=True)
class LanguageExportTarget:
    """One emitted symbol used to create exports for a file/barrel."""

    symbol: str
    target_path: Path
    source_path: Path
    alias: str | None = None


@dataclass(frozen=True)
class LanguageExportRequest:
    """Request used to create file-level exports."""

    source_path: Path
    targets: tuple[LanguageExportTarget, ...]
    strategy: str
    runtime: LanguageRuntime


class LanguageAdapter(Protocol):
    """Required interface every Codepotx language adapter must implement."""

    key: str

    def create_runtime(self, request: LanguageRuntimeRequest) -> LanguageRuntime:
        """Create global language runtime context."""

    def enrich_item(
        self,
        record: SpecRecord[object],
        runtime: LanguageRuntime,
    ) -> LanguageItem:
        """Create generic per-item `.lang` context."""

    def enrich_field(
        self,
        field: object,
        runtime: LanguageRuntime,
    ) -> LanguageField:
        """Create field-level `.lang` context."""

    def enrich_operation(
        self,
        operation: object,
        runtime: LanguageRuntime,
    ) -> LanguageOperation:
        """Create operation-level `.lang` context."""

    def enrich_route(
        self,
        route: object,
        runtime: LanguageRuntime,
    ) -> LanguageRoute:
        """Create route-level `.lang` context."""

    def create_type(
        self,
        request: LanguageTypeRequest,
        runtime: LanguageRuntime,
    ) -> LanguageType:
        """Create a language-specific type annotation."""

    def create_imports(
        self,
        request: LanguageImportRequest,
    ) -> tuple[LanguageImport, ...]:
        """Create file-level imports after emission/dependency planning."""

    def create_exports(
        self,
        request: LanguageExportRequest,
    ) -> tuple[LanguageExport, ...]:
        """Create file-level exports for normal files or barrels."""
