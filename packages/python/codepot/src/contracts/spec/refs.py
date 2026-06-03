"""Reference and identity contracts for normalized spec records."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SpecRef:
    """Normalized portable spec reference.

    ``subject`` is the dependency/emission subject used by template resolution,
    for example ``enums``, ``models``, ``dtos``, ``resources``, ``routes``.
    """

    value: str
    subject: str | None = None


@dataclass(frozen=True)
class SpecIdentity:
    """Parsed identity metadata from a compiled record key.

    Dot notation is identity metadata, not a filesystem path.

    Example:
        ``entity.user.email``

    Means:
        owner_identity = ``entity``
        owner_key = ``user``
        local_key = ``email``
    """

    raw: str
    local_key: str
    owner_identity: str | None = None
    owner_key: str | None = None


@dataclass(frozen=True)
class SpecOwner:
    """Normalized owner metadata for an owned spec item."""

    key: str
    ref: SpecRef
    identity: SpecIdentity
