"""Language adapter registry."""

from __future__ import annotations

from dataclasses import dataclass, field

from contracts.language.interface import LanguageAdapter


@dataclass
class LanguageRegistry:
    """Registry for Codepotx language adapters."""

    _adapters: dict[str, LanguageAdapter] = field(default_factory=dict)

    def register(self, adapter: LanguageAdapter) -> None:
        """Register a language adapter by its key."""

        self._adapters[adapter.key] = adapter

    def get(self, key: str) -> LanguageAdapter:
        """Get a registered language adapter."""

        try:
            return self._adapters[key]
        except KeyError as exc:
            available = ", ".join(sorted(self._adapters)) or "none"
            raise ValueError(f"Unknown language '{key}'. Available languages: {available}.") from exc  # noqa: E501

    def keys(self) -> tuple[str, ...]:
        """Return registered language keys."""

        return tuple(sorted(self._adapters))

    def has(self, key: str) -> bool:
        """Return true when a language key is registered."""

        return key in self._adapters


language_registry = LanguageRegistry()
