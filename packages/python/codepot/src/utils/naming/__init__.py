"""Shared naming utilities for generator contexts.

The naming package exposes a unified NameProvider used by language planners,
emission planners, template path expansion, and debug rendering. Access order
is case-first and pluralisation-second, for example name.snake.s or name.path.p.
"""

from utils.naming.provider import NameProvider, NameSet, PluralizedName, build_name

__all__ = [
    "NameProvider",
    "NameSet",
    "PluralizedName",
    "build_name",
]
