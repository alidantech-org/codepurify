"""Spec repository ownership helpers."""

from __future__ import annotations

from contracts.spec.refs import SpecIdentity, SpecOwner
from spec.repository.names import create_spec_name
from spec.repository.refs import create_spec_ref
from spec.utils.enums import SpecSubject
from spec.utils.identity import has_owner_identity, parse_identity


def create_spec_identity(key: str) -> SpecIdentity:
    """Create normalized spec identity from a compiled key."""

    parsed = parse_identity(key)

    return SpecIdentity(
        raw=parsed.raw,
        local_key=parsed.local_key,
        owner_identity=parsed.owner_identity,
        owner_key=parsed.owner_key,
    )


def create_owner_from_identity(
    *,
    key: str,
    owner_subject: SpecSubject,
) -> SpecOwner | None:
    """Create owner metadata from a dot-identity key when available."""

    parsed = parse_identity(key)

    if not has_owner_identity(parsed):
        return None

    if parsed.owner_key is None:
        return None

    owner_identity = SpecIdentity(
        raw=parsed.owner_key,
        local_key=parsed.owner_key,
        owner_identity=parsed.owner_identity,
        owner_key=parsed.owner_key,
    )
    owner_name = create_spec_name(parsed.owner_key)

    return SpecOwner(
        key=parsed.owner_key,
        ref=create_spec_ref(subject=owner_subject, key=parsed.owner_key),
        identity=owner_identity,
        name=owner_name,
        folders=(owner_name.path,),
    )
