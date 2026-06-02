"""Template package configuration contracts."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TemplateLanguageConfig:
    """Language metadata declared by a template package."""

    name: str
    extension: str
    package_manager: str | None = None


@dataclass(frozen=True)
class TemplateDefaultsConfig:
    """Default locations declared by a template package."""

    output: str
    paths: str


@dataclass(frozen=True)
class TemplateStaticConfig:
    """Static asset write behavior."""

    copy_if_changed: bool = True
    skip_if_same: bool = True


@dataclass(frozen=True)
class TemplateFormattingConfig:
    """Formatting commands declared by a template package."""

    enabled: bool
    command: str | None = None
    check_command: str | None = None


@dataclass(frozen=True)
class TemplateCommandConfig:
    """Named command declared by a template package."""

    name: str
    command: str


@dataclass(frozen=True)
class TemplateHookConfig:
    """Lifecycle hook declared by a template package."""

    message: str
    command: str
    run_by_default: bool = False


@dataclass(frozen=True)
class TemplateMessageConfig:
    """User-facing messages declared by a template package."""

    success: tuple[str, ...] = ()


@dataclass(frozen=True)
class TemplatePackageConfig:
    """Template package control file."""

    version: int
    name: str
    label: str
    description: str
    language: TemplateLanguageConfig
    defaults: TemplateDefaultsConfig
    static: TemplateStaticConfig
    formatting: TemplateFormattingConfig
    commands: tuple[TemplateCommandConfig, ...]
    after_emit_hooks: tuple[TemplateHookConfig, ...]
    messages: TemplateMessageConfig
