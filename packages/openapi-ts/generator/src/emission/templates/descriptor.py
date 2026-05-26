"""Template descriptor and owner classification."""

from __future__ import annotations

from constants.emission import (
    OWNER_PREFIX_BARREL,
    OWNER_PREFIX_DTO,
    OWNER_PREFIX_FIELD,
    OWNER_PREFIX_OPERATION,
    OWNER_PREFIX_RESOURCE,
    OWNER_PREFIX_SCHEMA,
    VARIABLE_PATTERN,
)
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
import re


class TemplateOwner(str, Enum):
    """Render owner for a template."""

    GLOBAL = "global"
    BARREL = "barrel"
    RESOURCE = "resource"
    OPERATION = "operation"
    DTO = "dto"
    SCHEMA = "schema"
    FIELD = "field"


@dataclass(frozen=True)
class TemplateDescriptor:
    """A scanned template file with ownership metadata."""

    source_path: Path
    relative_path: Path
    owner: TemplateOwner
    variables: tuple[str, ...]


VARIABLE_REGEX = re.compile(VARIABLE_PATTERN)


OWNER_PRIORITY = (
    (OWNER_PREFIX_DTO, TemplateOwner.DTO),
    (OWNER_PREFIX_OPERATION, TemplateOwner.OPERATION),
    (OWNER_PREFIX_SCHEMA, TemplateOwner.SCHEMA),
    (OWNER_PREFIX_RESOURCE, TemplateOwner.RESOURCE),
    (OWNER_PREFIX_BARREL, TemplateOwner.BARREL),
    (OWNER_PREFIX_FIELD, TemplateOwner.FIELD),
)


def describe_template(template_root: Path, source_path: Path) -> TemplateDescriptor:
    """Create a template descriptor from a source template path."""
    relative_path = source_path.relative_to(template_root)
    variables = extract_variables(relative_path)
    owner = classify_owner(variables)

    return TemplateDescriptor(
        source_path=source_path,
        relative_path=relative_path,
        owner=owner,
        variables=variables,
    )


def extract_variables(relative_path: Path) -> tuple[str, ...]:
    """Extract variable expressions used by a template path."""
    text = relative_path.as_posix()
    found: list[str] = []

    for match in VARIABLE_REGEX.finditer(text):
        value = next(group for group in match.groups() if group)
        found.append(value)

    return tuple(dict.fromkeys(found))


def classify_owner(variables: tuple[str, ...]) -> TemplateOwner:
    """Classify a template by variable namespace."""
    for prefix, owner in OWNER_PRIORITY:
        if any(variable.startswith(prefix) for variable in variables):
            return owner

    return TemplateOwner.GLOBAL
