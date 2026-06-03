"""Spec record creation helpers."""

from __future__ import annotations

from typing import Generic, TypeVar

from contracts.spec.records import SpecRecord
from contracts.spec.refs import SpecOwner
from spec.repository.ids import create_record_id
from spec.repository.names import create_spec_name
from spec.repository.ownership import create_spec_identity
from spec.repository.refs import create_spec_ref
from spec.repository.subjects import subject_to_record_kind
from spec.utils.enums import SpecSubject

TData = TypeVar("TData")


def create_spec_record(
    *,
    subject: SpecSubject,
    key: str,
    data: TData,
    owner: SpecOwner | None = None,
) -> SpecRecord[TData]:
    """Create a normalized spec record around typed IR data."""

    return SpecRecord(
        id=create_record_id(subject=subject, key=key, owner=owner),
        kind=subject_to_record_kind(subject),
        key=key,
        ref=create_spec_ref(subject=subject, key=key),
        identity=create_spec_identity(key),
        name=create_spec_name(key),
        data=data,
        owner=owner,
        dependencies=(),
    )


class TypedSpecRecord(Generic[TData]):
    """Typing marker for typed spec records.

    This class is intentionally empty. It is useful for explicit type aliases
    later without adding behavior to the record contract.
    """
