"""Build stable path/template variables."""

from __future__ import annotations

from dataclasses import dataclass

from codepot.pathing.identity import RecordIdentity, parse_record_identity
from utils.naming.provider import build_name_set


@dataclass(frozen=True)
class PathVariables:
    """Prepared path variables for one record."""

    key: str
    identity: RecordIdentity
    name: object


def build_path_variables(key: str) -> PathVariables:
    """Build prepared path variables from a record key."""

    identity = parse_record_identity(key)
    return PathVariables(
        key=key,
        identity=identity,
        name=build_name_set(identity.local_key),
    )
