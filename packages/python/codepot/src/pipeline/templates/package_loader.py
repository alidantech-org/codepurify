"""Load template package control files."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from contracts.template_package import (
    TemplateCommandConfig,
    TemplateDefaultsConfig,
    TemplateFormattingConfig,
    TemplateHookConfig,
    TemplateLanguageConfig,
    TemplateMessageConfig,
    TemplatePackageConfig,
    TemplateStaticConfig,
)
from utils.loaders.yaml_loader import load_yaml_data


def load_template_package_config(path: Path) -> TemplatePackageConfig:
    """Load a template package codepot.yaml file."""

    data = load_yaml_data(path)
    language = _mapping(data, "language")
    defaults = _mapping(data, "defaults")
    static = data.get("static") or {}
    formatting = data.get("formatting") or {}
    commands = data.get("commands") or {}
    hooks = data.get("hooks") or {}
    messages = data.get("messages") or {}

    return TemplatePackageConfig(
        version=int(data["version"]),
        name=str(data["name"]),
        label=str(data["label"]),
        description=str(data["description"]),
        language=TemplateLanguageConfig(
            name=str(language["name"]),
            extension=str(language["extension"]),
            package_manager=_optional_str(language.get("package_manager")),
        ),
        defaults=TemplateDefaultsConfig(
            output=str(defaults["output"]),
            paths=str(defaults["paths"]),
        ),
        static=TemplateStaticConfig(
            copy_if_changed=bool(static.get("copy_if_changed", True)),
            skip_if_same=bool(static.get("skip_if_same", True)),
        ),
        formatting=TemplateFormattingConfig(
            enabled=bool(formatting.get("enabled", False)),
            command=_optional_str(formatting.get("command")),
            check_command=_optional_str(formatting.get("check_command")),
        ),
        commands=tuple(
            TemplateCommandConfig(name=str(name), command=str(command))
            for name, command in commands.items()
        ),
        after_emit_hooks=tuple(
            TemplateHookConfig(
                message=str(item["message"]),
                command=str(item["command"]),
                run_by_default=bool(item.get("run_by_default", False)),
            )
            for item in hooks.get("after_emit", ())
        ),
        messages=TemplateMessageConfig(
            success=tuple(str(item) for item in messages.get("success", ())),
        ),
    )


def _mapping(data: dict[str, Any], key: str) -> dict[str, Any]:
    value = data[key]
    if not isinstance(value, dict):
        raise ValueError(f"Expected '{key}' to be a mapping.")
    return value


def _optional_str(value: object) -> str | None:
    return None if value is None else str(value)
