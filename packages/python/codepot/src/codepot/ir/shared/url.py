"""URL models for compiled Codepot IR."""

from __future__ import annotations

from enum import StrEnum

from pydantic import ConfigDict

from codepot.ir.shared.base import DefinitionItem


class UrlEnv(StrEnum):
    """Known URL environments."""

    LOCAL = "local"
    DEVELOPMENT = "development"
    PREVIEW = "preview"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


class UrlKind(StrEnum):
    """Known URL use/kind values."""

    API = "api"
    WEBSITE = "website"
    ADMIN = "admin"
    DOCS = "docs"
    ASSETS = "assets"
    CDN = "cdn"
    WEBSOCKET = "websocket"
    WEBHOOK = "webhook"
    AUTH = "auth"
    CUSTOM = "custom"


class UrlProtocol(StrEnum):
    """Known URL protocol values."""

    HTTP = "http"
    HTTPS = "https"
    WS = "ws"
    WSS = "wss"


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