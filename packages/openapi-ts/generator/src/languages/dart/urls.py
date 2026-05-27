"""OpenAPI server URL helpers for Dart package initialization."""

from __future__ import annotations

from contracts.api import ApiContract

DEFAULT_BASE_URL = ""


def default_base_url(api: ApiContract) -> str:
    """Return the first OpenAPI server URL when available."""
    servers = getattr(api, "servers", ())
    if not servers:
        return DEFAULT_BASE_URL

    first = servers[0]
    url = getattr(first, "url", None)

    if isinstance(url, str) and url.strip():
        return url.strip()

    return DEFAULT_BASE_URL
