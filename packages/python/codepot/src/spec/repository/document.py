"""Root Codepot repository."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from spec.ir.shared.document import CodepotDefinition
from spec.ir.shared.ref import Ref
from spec.loader import load_spec
from spec.repository.graph import RefGraph
from spec.repository.record_sets import RecordSet
from spec.repository.records import IrRecord
from spec2 import (
    SpecContentStrategy,
    SpecContentType,
    SpecContext,
    SpecCounts,
    SpecDefinitionMeta,
    SpecFileMetadata,
    SpecIdentity,
    SpecMetadata,
    SpecName,
    SpecOperation,
    SpecOperationInput,
    SpecOperationOutput,
    SpecProjectMetadata,
    SpecRecord,
    SpecRecordKind,
    SpecRef,
    SpecResource,
    SpecResourceDefaults,
    SpecRoutePath,
)
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
        return cls.from_data(load_spec(path), file_metadata=metadata)

    @classmethod
    def from_data(
        cls,
        data: dict[str, Any],
        *,
        file_metadata: FileMetadata | None = None,
    ) -> SpecRepository:
        """Validate raw spec data and build a normalized repository."""

        return cls.from_document(
            CodepotDefinition.model_validate(data),
            file_metadata=file_metadata,
        )

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
            file=SpecFileMetadata(
                path=self.file_metadata.path,
                size_bytes=self.file_metadata.size_bytes,
                size_label=self.file_metadata.size_label,
                line_count=self.file_metadata.line_count,
            ),
            project=SpecProjectMetadata(
                codepot_version=self.document.codepot,
                project_key=self.document.key,
                spec_version=self.document.version,
                title=self.document.info.title,
                api_version=self.document.info.version,
                summary=self.document.info.summary,
                terms_of_service=self.document.info.terms_of_service,
            ),
            contact=None,
            license=None,
            links=None,
        )

    def counts(self) -> SpecCounts:
        """Return real counts for inspect and validate output."""

        operations = sum(len(record.value.operations) for record in self.resources.records)
        routes = sum(len(record.value.routes) for record in self.resources.records)
        security_credentials = len(self.document.security.credentials)
        security_principals = len(self.document.security.principals)
        security_policies = len(self.document.security.policies)
        security_total = security_credentials + security_principals + security_policies
        enum_values = sum(len(record.value.values) for record in self.enums.records)
        composite_fields = sum(len(record.value.properties) for record in self.composites.records)
        entity_fields = sum(len(record.value.fields) for record in self.entities.records)
        field_set_fields = sum(len(record.value.fields) for record in self.field_sets.records)
        model_fields = sum(len(record.value.fields) for record in self.models.records)
        dto_fields = sum(len(record.value.fields) for record in self.dtos.records)
        route_responses = sum(
            len(method.responses)
            for resource in self.resources.records
            for route in resource.value.routes.values()
            for method in route.methods.values()
        )
        route_methods = sum(
            len(route.methods)
            for resource in self.resources.records
            for route in resource.value.routes.values()
        )
        properties_total = self.primitives.count() + self.enums.count() + self.composites.count()
        schemas_total = (
            self.entities.count()
            + self.field_sets.count()
            + self.models.count()
            + self.dtos.count()
            + self.params.count()
        )
        responses_total = self.errors.count()
        records_total = (
            len(self.document.urls)
            + self.content_types.count()
            + properties_total
            + schemas_total
            + self.resources.count()
            + responses_total
            + security_total
        )

        return SpecCounts(
            urls=len(self.document.urls),
            content_types=self.content_types.count(),
            primitives=self.primitives.count(),
            enums=self.enums.count(),
            enum_values=enum_values,
            composites=self.composites.count(),
            composite_fields=composite_fields,
            entities=self.entities.count(),
            entity_fields=entity_fields,
            field_sets=self.field_sets.count(),
            field_set_fields=field_set_fields,
            models=self.models.count(),
            model_fields=model_fields,
            dtos=self.dtos.count(),
            dto_fields=dto_fields,
            params=self.params.count(),
            resources=self.resources.count(),
            operations=operations,
            route_paths=routes,
            route_methods=route_methods,
            route_responses=route_responses,
            error_responses=self.errors.count(),
            security_credentials=security_credentials,
            security_principals=security_principals,
            security_policies=security_policies,
            properties_total=properties_total,
            schemas_total=schemas_total,
            routes_total=routes,
            responses_total=responses_total,
            security_total=security_total,
            records_total=records_total,
        )

    def context(self) -> SpecContext:
        """Return the normalized public spec context."""

        content_types = tuple(
            SpecContentType(
                record=_record(SpecRecordKind.CONTENT_TYPE, record.key, record.ref.ref),
                media_type=record.value.type,
                strategy=SpecContentStrategy(record.value.strategy.value),
                binary=bool(record.value.binary),
                structured=bool(record.value.structured),
            )
            for record in self.content_types.records
        )
        resources = tuple(
            SpecResource(
                record=_record(SpecRecordKind.RESOURCE, record.key, record.ref.ref),
                base_path=record.value.base_path,
                folders=tuple(record.value.folders),
                defaults=SpecResourceDefaults(security=None),
                operations=tuple(
                    SpecOperation(
                        record=_record(
                            SpecRecordKind.OPERATION,
                            operation_key,
                            f"{record.ref.ref}/operations/{operation_key}",
                        ),
                        resource=SpecRef(
                            value=record.ref.ref,
                            target_kind=SpecRecordKind.RESOURCE,
                        ),
                        input=SpecOperationInput(
                            context=tuple(
                                _spec_ref(item.ref)
                                for item in operation.input.context or ()
                            ),
                            params=_spec_ref(operation.input.params.ref)
                            if operation.input.params
                            else None,
                            query=_spec_ref(operation.input.query.ref)
                            if operation.input.query
                            else None,
                            body=_spec_ref(operation.input.body.ref)
                            if operation.input.body
                            else None,
                        ),
                        output=SpecOperationOutput(
                            result=_spec_ref(operation.output.result.ref)
                            if operation.output.result
                            else None,
                            errors=tuple(
                                _spec_ref(item.ref)
                                for item in operation.output.errors or ()
                            ),
                        ),
                    )
                    for operation_key, operation in record.value.operations.items()
                ),
                routes=tuple(
                    SpecRoutePath(
                        record=_record(
                            SpecRecordKind.ROUTE_PATH,
                            route_key,
                            f"{record.ref.ref}/routes/{route_key}",
                        ),
                        resource=SpecRef(value=record.ref.ref, target_kind=SpecRecordKind.RESOURCE),
                        path=route.path,
                        parameters=tuple(
                            (key, _spec_ref(value.ref))
                            for key, value in (route.parameters or {}).items()
                        ),
                        methods=(),
                    )
                    for route_key, route in record.value.routes.items()
                ),
            )
            for record in self.resources.records
        )

        return SpecContext(
            metadata=self.metadata(),
            counts=self.counts(),
            urls=(),
            content_types=content_types,
            primitives=(),
            enums=(),
            composites=(),
            entities=(),
            field_sets=(),
            models=(),
            dtos=(),
            params=(),
            resources=resources,
            error_responses=(),
            security_credentials=(),
            security_principals=(),
            security_policies=(),
            all_records=tuple(item.record for item in (*content_types, *resources)),
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
            "routes": counts.routes_total,
            "responses": counts.responses_total,
            "security": counts.security_total,
            "urls": counts.urls,
            "properties": counts.properties_total,
            "schemas": counts.schemas_total,
        }

def _records(prefix: str, values: dict[str, Any]) -> RecordSet[IrRecord[Any]]:
    records = tuple(
        IrRecord(key=key, ref=_ref(f"{prefix}/{key}"), value=value)
        for key, value in values.items()
    )
    return RecordSet(records)


def _record(kind: SpecRecordKind, key: str, ref: str) -> SpecRecord:
    return SpecRecord(
        kind=kind,
        key=key,
        ref=SpecRef(value=ref, target_kind=kind),
        identity=SpecIdentity(raw=key, local_key=key),
        name=SpecName(
            raw=key,
            clean=key,
            pascal=key,
            camel=key,
            snake=key,
            kebab=key,
            screaming_snake=key.upper(),
            constant=key.upper(),
            path=key,
        ),
        definition=SpecDefinitionMeta(),
    )


def _spec_ref(value: str, target_kind: SpecRecordKind | None = None) -> SpecRef:
    return SpecRef(value=value, target_kind=target_kind)
