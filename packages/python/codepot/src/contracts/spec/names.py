"""Name contracts for normalized spec records."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class SpecNameCase(StrEnum):
    """Supported name case selectors."""

    RAW = "raw"
    CLEAN = "clean"
    PASCAL = "pascal"
    CAMEL = "camel"
    SNAKE = "snake"
    KEBAB = "kebab"
    SCREAMING_SNAKE = "screaming_snake"
    CONSTANT = "constant"
    PATH = "path"


@dataclass(frozen=True)
class SpecNameCases:
    """Prepared casing variants for one name."""

    raw: str
    clean: str
    pascal: str
    camel: str
    snake: str
    kebab: str
    screaming_snake: str
    constant: str
    path: str


@dataclass(frozen=True)
class SpecName:
    """Prepared naming context for a normalized spec item.

    Singular and plural are nested casing objects, so access is explicit:

    - ``name.singular.path``
    - ``name.singular.pascal``
    - ``name.plural.path``
    - ``name.plural.camel``

    Do not expose direct string fields like ``name.singular`` or
    ``name.plural``.
    """

    raw: str
    clean: str
    pascal: str
    camel: str
    snake: str
    kebab: str
    screaming_snake: str
    constant: str
    path: str
    singular: SpecNameCases
    plural: SpecNameCases


def resolve_name_case(name: SpecName, case: SpecNameCase) -> str:
    """Resolve a name case without dynamic attribute access."""

    if case == SpecNameCase.RAW:
        return name.raw
    if case == SpecNameCase.CLEAN:
        return name.clean
    if case == SpecNameCase.PASCAL:
        return name.pascal
    if case == SpecNameCase.CAMEL:
        return name.camel
    if case == SpecNameCase.SNAKE:
        return name.snake
    if case == SpecNameCase.KEBAB:
        return name.kebab
    if case == SpecNameCase.SCREAMING_SNAKE:
        return name.screaming_snake
    if case == SpecNameCase.CONSTANT:
        return name.constant
    if case == SpecNameCase.PATH:
        return name.path

    raise ValueError(f"Unsupported name case: {case}")
