"""paths.yaml contract loading helpers."""

from __future__ import annotations

from typing import Any

from contracts.paths import (
    PathConfig,
    PathFolder,
    PathImportConfig,
    PathSelectionMode,
    default_path_rules,
)

KEY_FOLDERS = "folders"
KEY_IMPORTS = "imports"
KEY_STRATEGY = "strategy"
KEY_SELECT = "select"
KEY_AS = "as"
KEY_ALIAS = "alias"
KEY_MODE = "mode"
KEY_PARTS = "parts"
KEY_DESCRIPTION = "description"
KEY_TEMPLATE_EXTENSION = "template_extension"
KEY_STRIP_TEMPLATE_EXTENSION = "strip_template_extension"
KEY_ALLOW_RAW_FILES = "allow_raw_files"
KEY_META = "meta"

DEFAULT_TEMPLATE_EXTENSION = ".j2"
IMPORT_STRATEGY_RELATIVE = "relative"
IMPORT_STRATEGY_NONE = "none"
ALLOWED_IMPORT_STRATEGIES = {IMPORT_STRATEGY_RELATIVE, IMPORT_STRATEGY_NONE}


class PathYamlError(ValueError):
    """Raised when paths.yaml contains invalid structure."""


def path_config_from_yaml(data: dict[str, Any] | None) -> PathConfig:
    """Build a PathConfig from parsed paths.yaml data."""
    if data is None:
        data = {}

    if not isinstance(data, dict):
        raise PathYamlError("paths.yaml root must be an object.")

    return PathConfig(
        folders=_parse_folders(data.get(KEY_FOLDERS, {})),
        imports=_parse_imports(data.get(KEY_IMPORTS)),
        template_extension=_string(
            data.get(KEY_TEMPLATE_EXTENSION),
            default=DEFAULT_TEMPLATE_EXTENSION,
            field_name=KEY_TEMPLATE_EXTENSION,
        ),
        strip_template_extension=_bool(
            data.get(KEY_STRIP_TEMPLATE_EXTENSION),
            default=True,
            field_name=KEY_STRIP_TEMPLATE_EXTENSION,
        ),
        allow_raw_files=_bool(
            data.get(KEY_ALLOW_RAW_FILES),
            default=True,
            field_name=KEY_ALLOW_RAW_FILES,
        ),
        rules=default_path_rules(),
        meta=_dict(data.get(KEY_META), field_name=KEY_META),
    )


def _parse_imports(raw: Any) -> PathImportConfig:
    if raw is None:
        return PathImportConfig()

    if not isinstance(raw, dict):
        raise PathYamlError("'imports' must be an object.")

    strategy = _string(
        raw.get(KEY_STRATEGY),
        default=IMPORT_STRATEGY_RELATIVE,
        field_name=f"{KEY_IMPORTS}.{KEY_STRATEGY}",
    )
    if strategy not in ALLOWED_IMPORT_STRATEGIES:
        allowed = ", ".join(sorted(ALLOWED_IMPORT_STRATEGIES))
        raise PathYamlError(f"Invalid imports.strategy: {strategy}. Allowed: {allowed}.")

    return PathImportConfig(strategy=strategy)


def _parse_folders(raw: Any) -> tuple[PathFolder, ...]:
    if raw is None:
        return ()

    if not isinstance(raw, dict):
        raise PathYamlError("'folders' must be an object.")

    folders: list[PathFolder] = []

    for name, value in raw.items():
        if not isinstance(name, str) or not name:
            raise PathYamlError("Path folder names must be non-empty strings.")

        if not isinstance(value, dict):
            raise PathYamlError(f"Path folder '{name}' must be an object.")

        folders.append(_parse_folder(name, value))

    return tuple(folders)


def _parse_folder(name: str, raw: dict[str, Any]) -> PathFolder:
    select = _required_string(raw, KEY_SELECT, owner=name)
    alias = _string(
        raw.get(KEY_AS, raw.get(KEY_ALIAS)),
        default=name,
        field_name=f"{name}.{KEY_AS}",
    )

    return PathFolder(
        name=name,
        select=select,
        alias=alias,
        parts=_parse_parts(raw.get(KEY_PARTS), folder=name),
        mode=_mode(raw.get(KEY_MODE), folder=name),
        description=_string(
            raw.get(KEY_DESCRIPTION),
            default="-",
            field_name=f"{name}.{KEY_DESCRIPTION}",
        ),
    )


def _parse_parts(raw: Any, *, folder: str) -> tuple[Any, ...]:
    if not isinstance(raw, list | tuple) or not raw:
        raise PathYamlError(f"'{folder}.parts' is required and must be a non-empty list.")

    return tuple(_parse_part(part, folder=folder) for part in raw)


def _parse_part(value: Any, *, folder: str) -> Any:
    if isinstance(value, str):
        if not value:
            raise PathYamlError(f"'{folder}.parts' entries must be non-empty.")
        return value

    if isinstance(value, list | tuple) and len(value) == 1 and isinstance(value[0], str) and value[0]:
        return f"[{value[0]}]"

    raise PathYamlError(f"'{folder}.parts' entries must be strings or single-expression lists.")


def _mode(value: Any, *, folder: str) -> PathSelectionMode:
    if value is None:
        return PathSelectionMode.EACH

    try:
        return PathSelectionMode(str(value))
    except ValueError as exc:
        allowed = ", ".join(item.value for item in PathSelectionMode)
        raise PathYamlError(f"Invalid mode for folder '{folder}': {value}. Allowed: {allowed}.") from exc


def _required_string(raw: dict[str, Any], key: str, *, owner: str) -> str:
    value = raw.get(key)

    if not isinstance(value, str) or not value:
        raise PathYamlError(f"'{owner}.{key}' is required and must be a non-empty string.")

    return value


def _string(value: Any, *, default: str, field_name: str) -> str:
    if value is None:
        return default

    if not isinstance(value, str):
        raise PathYamlError(f"'{field_name}' must be a string.")

    return value


def _bool(value: Any, *, default: bool, field_name: str) -> bool:
    if value is None:
        return default

    if not isinstance(value, bool):
        raise PathYamlError(f"'{field_name}' must be a boolean.")

    return value


def _dict(value: Any, *, field_name: str) -> dict[str, Any]:
    if value is None:
        return {}

    if not isinstance(value, dict):
        raise PathYamlError(f"'{field_name}' must be an object.")

    return dict(value)
