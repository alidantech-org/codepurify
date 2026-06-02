"""Normalized repository record models."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar

from codepot.ir.shared.ref import Ref

ValueT = TypeVar("ValueT")


@dataclass(frozen=True)
class IrRecord(Generic[ValueT]):
    """Normalized IR map entry with key promoted to data."""

    key: str
    ref: Ref[ValueT]
    value: ValueT


@dataclass(frozen=True)
class OwnedIrRecord(Generic[ValueT]):
    """Normalized IR record owned by another IR record."""

    key: str
    ref: Ref[ValueT]
    owner: Ref[object]
    value: ValueT
