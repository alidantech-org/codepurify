"""URL models for compiled Codepot IR."""

from __future__ import annotations

from pydantic import ConfigDict

from spec.ir.shared.base import DefinitionItem
from spec.kinds.urls import UrlEnv, UrlKind, UrlProtocol


class UrlDefinition(DefinitionItem):
    """Compiled Codepot URL definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    key: str
    kind: UrlKind
    env: UrlEnv
    uri: str
    protocol: UrlProtocol | None = None
    base_path: str | None = None
    label: str | None = None
