"""paths.yaml contract loading helpers.

This module converts raw YAML data into typed path authoring contracts.
It does not read files directly; callers pass parsed YAML dictionaries.
"""

from __future__ import annotations

from typing import Any

from contracts.paths import (
    PathConfig,
    PathExpose,
    PathSelectionMode,
    PathValueKind,
    PathVariable,
    default_path_rules,
)

KEY_VARIABLES = "variables"
KEY_SELECT = "select"
KEY_AS = "as"
KEY_ALIAS = "alias"
KEY_MODE = "mode"
KEY_EXPOSE = "expose"
KEY_DESCRIPTION = "description"
KEY_VALUE_KIND = "value_kind"
KEY_TEMPLATE_EXTENSION = "template_extension"
KEY_STRIP_TEMPLATE_EXTENSION = "strip_template_extension"
KEY_ALLOW_RAW_FILES = "allow_raw_files"
KEY_META = "meta"

DEFAULT_TEMPLATE_EXTENSION = ".j2"


class PathYamlError(ValueError):
    """Raised when paths.yaml contains invalid structure."""


def path_config_from_yaml(data: dict[str, Any] | None) -> PathConfig:
    """Build a PathConfig from parsed paths.yaml data."""
    if data is None:
        data = {}

    if not isinstance(data, dict):
        raise PathYamlError("paths.yaml root must be an object.")

    variables = _parse_variables(data.get(KEY_VARIABLES, {}))

    return PathConfig(
        variables=variables,
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


def _parse_variables(raw: Any) -> tuple[PathVariable, ...]:
    if raw is None:
        return ()

    if not isinstance(raw, dict):
        raise PathYamlError("'variables' must be an object.")

    variables: list[PathVariable] = []

    for name, value in raw.items():
        if not isinstance(name, str) or not name:
            raise PathYamlError("Path variable names must be non-empty strings.")

        if not isinstance(value, dict):
            raise PathYamlError(f"Path variable '{name}' must be an object.")

        variables.append(_parse_variable(name, value))

    return tuple(variables)


def _parse_variable(name: str, raw: dict[str, Any]) -> PathVariable:
    select = _required_string(raw, KEY_SELECT, owner=name)
    alias = _string(
        raw.get(KEY_AS, raw.get(KEY_ALIAS)),
        default=name,
        field_name=f"{name}.{KEY_AS}",
    )

    return PathVariable(
        name=name,
        select=select,
        alias=alias,
        mode=_mode(raw.get(KEY_MODE), variable=name),
        expose=_parse_expose(raw.get(KEY_EXPOSE, {}), variable=name),
        description=_string(
            raw.get(KEY_DESCRIPTION),
            default="-",
            field_name=f"{name}.{KEY_DESCRIPTION}",
        ),
    )


def _parse_expose(raw: Any, *, variable: str) -> tuple[PathExpose, ...]:
    if raw is None:
        return ()

    if not isinstance(raw, dict):
        raise PathYamlError(f"'{variable}.expose' must be an object.")

    exposes: list[PathExpose] = []

    for name, value in raw.items():
        if not isinstance(name, str) or not name:
            raise PathYamlError(f"Expose name in '{variable}' must be a non-empty string.")

        if isinstance(value, str):
            exposes.append(PathExpose(name=name, expression=value))
            continue

        if isinstance(value, dict):
            expression = _required_string(value, "expression", owner=f"{variable}.expose.{name}")
            exposes.append(
                PathExpose(
                    name=name,
                    expression=expression,
                    value_kind=_value_kind(value.get(KEY_VALUE_KIND), owner=f"{variable}.{name}"),
                    description=_string(
                        value.get(KEY_DESCRIPTION),
                        default="-",
                        field_name=f"{variable}.{name}.{KEY_DESCRIPTION}",
                    ),
                )
            )
            continue

        raise PathYamlError(f"Expose '{variable}.{name}' must be a string or object.")

    return tuple(exposes)


def _mode(value: Any, *, variable: str) -> PathSelectionMode:
    if value is None:
        return PathSelectionMode.EACH

    try:
        return PathSelectionMode(str(value))
    except ValueError as exc:
        allowed = ", ".join(item.value for item in PathSelectionMode)
        raise PathYamlError(f"Invalid mode for variable '{variable}': {value}. Allowed: {allowed}.") from exc


def _value_kind(value: Any, *, owner: str) -> PathValueKind:
    if value is None:
        return PathValueKind.ANY

    try:
        return PathValueKind(str(value))
    except ValueError as exc:
        allowed = ", ".join(item.value for item in PathValueKind)
        raise PathYamlError(f"Invalid value_kind for '{owner}': {value}. Allowed: {allowed}.") from exc


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
