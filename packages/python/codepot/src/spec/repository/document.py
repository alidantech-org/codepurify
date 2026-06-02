"""Root Codepot repository."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from contracts.repository import SpecCounts, SpecMetadata
from spec.ir.shared.document import CodepotDefinition
from spec.ir.shared.ref import Ref
from spec.loader import load_spec
from spec.repository.graph import RefGraph
from spec.repository.record_sets import RecordSet
from spec.repository.records import IrRecord
from utils.files.metadata import FileMetadata, get_file_metadata


def _ref(path: str) -> Ref[Any]:
    return Ref[Any](**{"$ref": path})


@dataclass(frozen=True)
class SpecRepository:
    """Database-like access layer over typed Codepot IR."""

    document: CodepotDefinition
    file_metadata: FileMetadata
    content_types: RecordSet[IrRecord[Any]]
    primitives: RecordSet[IrRecord[Any]]
    enums: RecordSet[IrRecord[Any]]
    composites: RecordSet[IrRecord[Any]]
    entities: RecordSet[IrRecord[Any]]
    field_sets: RecordSet[IrRecord[Any]]
    models: RecordSet[IrRecord[Any]]
    dtos: RecordSet[IrRecord[Any]]
    params: RecordSet[IrRecord[Any]]
    resources: RecordSet[IrRecord[Any]]
    errors: RecordSet[IrRecord[Any]]
    graph: RefGraph

    @classmethod
    def from_file(cls, path: Path) -> SpecRepository:
        """Load a spec file and build a normalized repository."""

        metadata = get_file_metadata(path)
        return cls.from_document(load_spec(path), file_metadata=metadata)

    @classmethod
    def from_document(
        cls,
        document: CodepotDefinition,
        *,
        file_metadata: FileMetadata | None = None,
    ) -> SpecRepository:
        """Normalize map-shaped IR sections into typed record sets."""

        metadata = file_metadata or FileMetadata(
            path=Path("<memory>"),
            size_bytes=0,
            size_label="0 B",
            line_count=0,
        )
        return cls(
            document=document,
            file_metadata=metadata,
            content_types=_records("#/content_types", document.content_types),
            primitives=_records("#/properties/primitives", document.properties.primitives),
            enums=_records("#/properties/enums", document.properties.enums),
            composites=_records("#/properties/composites", document.properties.composites),
            entities=_records("#/schemas/entities", document.schemas.entities),
            field_sets=_records("#/schemas/field_sets", document.schemas.field_sets),
            models=_records("#/schemas/models", document.schemas.models),
            dtos=_records("#/schemas/dtos", document.schemas.dtos),
            params=_records("#/schemas/params", document.schemas.params),
            resources=_records("#/resources", document.resources),
            errors=_records("#/responses/errors", document.responses.errors),
            graph=RefGraph(),
        )

    def metadata(self) -> SpecMetadata:
        """Return source-file and root spec metadata."""

        return SpecMetadata(
            file_path=self.file_metadata.path,
            file_size_bytes=self.file_metadata.size_bytes,
            file_size_label=self.file_metadata.size_label,
            line_count=self.file_metadata.line_count,
            codepot_version=self.document.codepot,
            project_key=self.document.key,
            spec_version=self.document.version,
            title=self.document.info.title,
            api_version=self.document.info.version,
            summary=self.document.info.summary,
            urls_count=len(self.document.urls),
        )

    def counts(self) -> SpecCounts:
        """Return real counts for inspect and validate output."""

        operations = sum(len(record.value.operations) for record in self.resources.records)
        routes = sum(len(record.value.routes) for record in self.resources.records)
        security = len(self.document.security.credentials) + len(self.document.security.principals) + len(self.document.security.policies)

        return SpecCounts(
            content_types=self.content_types.count(),
            primitives=self.primitives.count(),
            enums=self.enums.count(),
            composites=self.composites.count(),
            entities=self.entities.count(),
            field_sets=self.field_sets.count(),
            models=self.models.count(),
            dtos=self.dtos.count(),
            params=self.params.count(),
            resources=self.resources.count(),
            operations=operations,
            routes=routes,
            responses=self.errors.count(),
            security=security,
            urls=len(self.document.urls),
        )

    def summary(self) -> dict[str, int | str]:
        """Return summary values for compatibility with existing callers."""

        counts = self.counts()
        return {
            "version": f"{self.document.codepot}-v{self.document.version}",
            "content_types": counts.content_types,
            "primitives": counts.primitives,
            "enums": counts.enums,
            "composites": counts.composites,
            "entities": counts.entities,
            "field_sets": counts.field_sets,
            "models": counts.models,
            "dtos": counts.dtos,
            "params": counts.params,
            "resources": counts.resources,
            "operations": counts.operations,
            "routes": counts.routes,
            "responses": counts.responses,
            "security": counts.security,
            "urls": counts.urls,
            "properties": counts.properties,
            "schemas": counts.schemas,
        }

    def schema_rows(self) -> tuple[dict[str, Any], ...]:
        """Return schema registry row counts."""

        return (
            {"name": "entities", "count": self.entities.count()},
            {"name": "field_sets", "count": self.field_sets.count()},
            {"name": "models", "count": self.models.count()},
            {"name": "dtos", "count": self.dtos.count()},
            {"name": "params", "count": self.params.count()},
        )

    def resource_rows(self) -> tuple[dict[str, Any], ...]:
        """Return one inspect row per resource."""

        return tuple(
            {
                "name": record.key,
                "base_path": record.value.base_path,
                "routes": len(record.value.routes),
                "operations": len(record.value.operations),
            }
            for record in self.resources.records
        )

    def content_type_rows(self) -> tuple[dict[str, Any], ...]:
        """Return one inspect row per content type."""

        return tuple(
            {
                "name": record.key,
                "type": record.value.type,
                "strategy": record.value.strategy,
            }
            for record in self.content_types.records
        )


def _records(prefix: str, values: dict[str, Any]) -> RecordSet[IrRecord[Any]]:
    records = tuple(IrRecord(key=key, ref=_ref(f"{prefix}/{key}"), value=value) for key, value in values.items())
    return RecordSet(records)


CodepotRepository = SpecRepository
