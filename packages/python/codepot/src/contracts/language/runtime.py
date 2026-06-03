"""Language runtime contracts."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path


class LanguageImportStrategy(StrEnum):
    """Supported import path strategies."""

    RELATIVE = "relative"
    ALIAS = "alias"
    PACKAGE = "package"
    ROOT = "root"


class LanguageNameRole(StrEnum):
    """Configurable language naming roles."""

    CLASS = "class"
    INTERFACE = "interface"
    ENUM = "enum"
    ENUM_VALUE = "enum_value"
    FIELD = "field"
    METHOD = "method"
    FUNCTION = "function"
    CONSTANT = "constant"
    FILE = "file"
    MODULE = "module"
    PACKAGE = "package"


@dataclass(frozen=True)
class LanguageNamingRules:
    """Resolved naming rule choices for a language runtime."""

    class_case: str
    interface_case: str
    enum_case: str
    enum_value_case: str
    field_case: str
    method_case: str
    function_case: str
    constant_case: str
    file_case: str
    module_case: str
    package_case: str


@dataclass(frozen=True)
class LanguageImportRules:
    """Resolved import strategy options for a language runtime."""

    strategy: LanguageImportStrategy
    root: str | None = None
    alias: str | None = None
    package: str | None = None
    include_extension: bool = False
    type_only: bool = False


@dataclass(frozen=True)
class LanguageRuntime:
    """Global language context available as ``language`` in templates."""

    name: str
    extension: str
    package_name: str | None
    package_manager: str | None
    source_root: Path
    naming: LanguageNamingRules
    imports: LanguageImportRules
