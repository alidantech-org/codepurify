"""Public repository API for typed Codepot IR."""

from spec.repository.document import SpecRepository
from spec.repository.graph import RefGraph
from spec.repository.record_sets import RecordSet
from spec.repository.records import IrRecord, OwnedIrRecord

__all__ = [
    "IrRecord",
    "OwnedIrRecord",
    "RecordSet",
    "RefGraph",
    "SpecRepository",
]
