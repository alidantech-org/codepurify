"""Name contracts for normalized spec records."""

from __future__ import annotations

from dataclasses import dataclass


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
