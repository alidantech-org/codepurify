"""Decorator-based language adapter registry."""

from __future__ import annotations

from collections.abc import Callable
from typing import TypeVar

from contracts.language import LanguageAdapter

AdapterT = TypeVar("AdapterT", bound=type)

_REGISTERED_ADAPTERS: dict[str, type[LanguageAdapter]] = {}
_ALIAS_TO_NAME: dict[str, str] = {}


class LanguageRegistrationError(ValueError):
    """Raised when a language adapter cannot be registered."""


def language_adapter(
    *,
    name: str,
    aliases: tuple[str, ...] = (),
    template_name: str | None = None,
) -> Callable[[AdapterT], AdapterT]:
    """Register a language adapter class."""
    normalized_name = _normalize_name(name)
    normalized_aliases = tuple(_normalize_name(alias) for alias in aliases)
    resolved_template_name = template_name or normalized_name

    def decorator(adapter_class: AdapterT) -> AdapterT:
        _set_metadata(
            adapter_class,
            name=normalized_name,
            aliases=normalized_aliases,
            template_name=resolved_template_name,
        )
        _register(adapter_class, normalized_name, normalized_aliases)
        return adapter_class

    return decorator


def get_registered_adapter(language: str) -> type[LanguageAdapter] | None:
    """Return a registered adapter class by name or alias."""
    normalized = _normalize_name(language)
    canonical = _ALIAS_TO_NAME.get(normalized, normalized)
    return _REGISTERED_ADAPTERS.get(canonical)


def list_registered_languages() -> tuple[str, ...]:
    """Return registered canonical language names."""
    return tuple(sorted(_REGISTERED_ADAPTERS))


def _register(
    adapter_class: type[LanguageAdapter],
    name: str,
    aliases: tuple[str, ...],
) -> None:
    if name in _REGISTERED_ADAPTERS:
        raise LanguageRegistrationError(f"language already registered: {name}")

    _REGISTERED_ADAPTERS[name] = adapter_class

    for alias in aliases:
        if alias in _ALIAS_TO_NAME:
            raise LanguageRegistrationError(f"language alias already registered: {alias}")
        _ALIAS_TO_NAME[alias] = name


def _set_metadata(
    adapter_class: type,
    *,
    name: str,
    aliases: tuple[str, ...],
    template_name: str,
) -> None:
    adapter_class.name = name
    adapter_class.aliases = aliases
    adapter_class.template_name = template_name


def _normalize_name(value: str) -> str:
    normalized = value.strip().lower().replace("_", "-")
    if not normalized:
        raise LanguageRegistrationError("language name cannot be empty")
    return normalized
