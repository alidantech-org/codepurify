"""Root Codepot repository."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from codepot.ir.shared.document import CodepotDefinition
from codepot.ir.shared.ref import Ref
from codepot.repository.graph import RefGraph
from codepot.repository.record_sets import RecordSet
from codepot.repository.records import IrRecord


def _ref(path: str) -> Ref[Any]:
    return Ref[Any](ref=path)


@dataclass(frozen=True)
class CodepotRepository:
    """Database-like access layer over typed Codepot IR."""

    document: CodepotDefinition
    content_types: RecordSet[IrRecord[Any]]
    primitives: RecordSet[IrRecord[Any]]
    enums: RecordSet[IrRecord[Any]]
    composites: RecordSet[IrRecord[Any]]
    entities: RecordSet[IrRecord[Any]]
    models: RecordSet[IrRecord[Any]]
    dtos: RecordSet[IrRecord[Any]]
    params: RecordSet[IrRecord[Any]]
    resources: RecordSet[IrRecord[Any]]
    errors: RecordSet[IrRecord[Any]]
    graph: RefGraph

    @classmethod
    def from_document(cls, document: CodepotDefinition) -> "CodepotRepository":
        """Normalize map-shaped IR sections into typed record sets."""

        return cls(
            document=document,
            content_types=_records("#/content_types", document.content_types),
            primitives=_records("#/properties/primitives", document.properties.primitives),
            enums=_records("#/properties/enums", document.properties.enums),
            composites=_records("#/properties/composites", document.properties.composites),
            entities=_records("#/schemas/entities", document.schemas.entities),
            models=_records("#/schemas/models", document.schemas.models),
            dtos=_records("#/schemas/dtos", document.schemas.dtos),
            params=_records("#/schemas/params", document.schemas.params),
            resources=_records("#/resources", document.resources),
            errors=_records("#/responses/errors", document.responses.errors),
            graph=RefGraph(),
        )


def _records(prefix: str, values: dict[str, Any]) -> RecordSet[IrRecord[Any]]:
    records = tuple(IrRecord(key=key, ref=_ref(f"{prefix}/{key}"), value=value) for key, value in values.items())
    return RecordSet(records)
