"""Dot-key identity parsing for Codepot records."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RecordIdentity:
    """Parsed identity metadata from a compiled key."""

    raw: str
    owner_identity: str | None
    owner_key: str | None
    local_key: str


def parse_record_identity(key: str) -> RecordIdentity:
    """Parse dot notation as identity metadata, not filesystem path."""

    parts = key.split(".")
    if len(parts) >= 3:
        return RecordIdentity(
            raw=key,
            owner_identity=parts[0],
            owner_key=parts[1],
            local_key=".".join(parts[2:]),
        )

    return RecordIdentity(
        raw=key,
        owner_identity=None,
        owner_key=None,
        local_key=key,
    )
