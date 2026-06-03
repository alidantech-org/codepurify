"""Safe output path variable expansion."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from pipeline.planning.path_variables import OutputPathVariables

VARIABLE_PATTERN = re.compile(
    r"\$\[([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\]"
)


@dataclass(frozen=True)
class ExpandedPathPart:
    """One expanded output path part."""

    value: str


def _split_variable_path(path: str) -> tuple[str, ...]:
    """Split a variable path into typed access tokens."""

    return tuple(part for part in path.split(".") if part)


def _read_name(root, token: str) -> str:
    """Read a supported name token from a name variable object."""

    if token == "raw":
        return root.raw
    if token == "clean":
        return root.clean
    if token == "pascal":
        return root.pascal
    if token == "camel":
        return root.camel
    if token == "snake":
        return root.snake
    if token == "kebab":
        return root.kebab
    if token == "screaming_snake":
        return root.screaming_snake
    if token == "constant":
        return root.constant
    if token == "path":
        return root.path

    raise ValueError(f"Unsupported name variable token: {token}")


def _read_variable(variables: OutputPathVariables, path: str) -> str:
    """Resolve one output path variable."""

    parts = _split_variable_path(path)

    if len(parts) == 2 and parts[0] == "language":
        if parts[1] == "name":
            return variables.language.name
        if parts[1] == "extension":
            return variables.language.extension
        if parts[1] == "package_name" and variables.language.package_name is not None:
            return variables.language.package_name

    if len(parts) == 2 and parts[0] == "template":
        if parts[1] == "id":
            return variables.template.id
        if parts[1] == "select":
            return variables.template.select
        if parts[1] == "kind":
            return variables.template.kind

    if len(parts) == 2 and parts[0] == "project":
        if parts[1] == "key":
            return variables.project.key
        if parts[1] == "version":
            return variables.project.version
        if parts[1] == "title":
            return variables.project.title

    if len(parts) == 2 and parts[0] == "global" and parts[1] == "alias":
        return variables.global_context.alias

    if variables.item is not None:
        if len(parts) == 2 and parts[0] == "item":
            if parts[1] == "id":
                return variables.item.id
            if parts[1] == "key":
                return variables.item.key
            if parts[1] == "ref":
                return variables.item.ref
        if len(parts) == 3 and parts[0] == "item" and parts[1] == "name":
            return _read_name(variables.item.name, parts[2])

    if variables.owner is not None:
        if len(parts) == 2 and parts[0] == "owner":
            if parts[1] == "key":
                return variables.owner.key
            if parts[1] == "folders":
                return "/".join(variables.owner.folders)
        if len(parts) == 3 and parts[0] == "owner" and parts[1] == "name":
            return _read_name(variables.owner.name, parts[2])

    if variables.resource is not None:
        if len(parts) == 2 and parts[0] == "resource":
            if parts[1] == "key":
                return variables.resource.key
            if parts[1] == "folders":
                return "/".join(variables.resource.folders)
        if len(parts) == 3 and parts[0] == "resource" and parts[1] == "name":
            return _read_name(variables.resource.name, parts[2])

    raise ValueError(f"Unsupported output path variable: $[{path}]")


def expand_path_text(text: str, variables: OutputPathVariables) -> str:
    """Expand all output path variables in one text segment."""

    def replace(match: re.Match[str]) -> str:
        return _read_variable(variables, match.group(1))

    return VARIABLE_PATTERN.sub(replace, text)


def safe_path_part(value: str) -> str:
    """Normalize and validate one output path segment."""

    normalized = value.strip().replace("\\", "/").strip("/")

    if not normalized:
        return ""

    parts = normalized.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValueError(f"Unsafe output path segment: {value}")

    return normalized


def expand_path_parts(
    parts: tuple[str, ...],
    variables: OutputPathVariables,
) -> tuple[ExpandedPathPart, ...]:
    """Expand path parts into safe output path parts."""

    expanded: list[ExpandedPathPart] = []

    for part in parts:
        value = safe_path_part(expand_path_text(part, variables))
        if value:
            expanded.append(ExpandedPathPart(value=value))

    return tuple(expanded)


def join_expanded_path(
    *,
    output_root: Path,
    folders: tuple[ExpandedPathPart, ...],
    file: ExpandedPathPart,
) -> Path:
    """Join expanded folders and file under output root."""

    folder_values = tuple(folder.value for folder in folders)

    if folder_values:
        return output_root.joinpath(*folder_values, file.value)

    return output_root / file.value
