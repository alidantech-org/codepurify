"""Normalized Codepot spec context contracts.

This module defines the stable context returned by ``spec.repository`` after it
loads, validates, normalizes, and resolves the compiled Codepot spec.

Important rules:
- Do not import raw ``spec.ir`` models here.
- Do not perform calculations here.
- Do not expose repository behavior here.
- Repository code may construct these models.
- Pipeline, planning, emission, languages, templates, and CLI may consume these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any


class SpecRecordKind(StrEnum):
    """Normalized spec record kinds."""

    URL = "url"
    CONTENT_TYPE = "content_type"

    PRIMITIVE = "primitive"
    ENUM = "enum"
    ENUM_VALUE = "enum_value"
    COMPOSITE = "composite"
    COMPOSITE_FIELD = "composite_field"

    ENTITY = "entity"
    ENTITY_FIELD = "entity_field"
    FIELD_SET = "field_set"
    MODEL = "model"
    MODEL_FIELD = "model_field"
    DTO = "dto"
    DTO_FIELD = "dto_field"
    PARAMS = "params"

    RESOURCE = "resource"
    OPERATION = "operation"
    ROUTE_PATH = "route_path"
    ROUTE_METHOD = "route_method"
    ROUTE_RESPONSE = "route_response"

    ERROR_RESPONSE = "error_response"

    SECURITY_CREDENTIAL = "security_credential"
    SECURITY_PRINCIPAL = "security_principal"
    SECURITY_POLICY = "security_policy"


class SpecPropertyKind(StrEnum):
    """Normalized reusable property kinds."""

    PRIMITIVE = "primitive"
    ENUM = "enum"
    COMPOSITE = "composite"


class SpecSchemaKind(StrEnum):
    """Normalized reusable schema kinds."""

    ENTITY = "entity"
    FIELD_SET = "field_set"
    MODEL = "model"
    DTO = "dto"
    PARAMS = "params"


class SpecFieldKind(StrEnum):
    """Normalized field kinds."""

    PROPERTY = "property"
    RELATION = "relation"
    ARRAY = "array"
    REF = "ref"


class SpecPrimitiveType(StrEnum):
    """Normalized primitive value types."""

    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    INTEGER = "integer"


class SpecPrimitiveFormat(StrEnum):
    """Normalized primitive formats."""

    DATE = "date"
    DATE_TIME = "date-time"
    TIME = "time"
    EMAIL = "email"
    URI = "uri"
    URL = "url"
    UUID = "uuid"
    OBJECT_ID = "object-id"
    PHONE = "phone"
    PASSWORD = "password"
    BINARY = "binary"
    CUSTOM = "custom"


class SpecContentStrategy(StrEnum):
    """Normalized content serialization strategies."""

    JSON = "json"
    XML = "xml"
    YAML = "yaml"
    HTML = "html"
    CSV = "csv"
    MULTIPART = "multipart"
    FORM = "form"
    TEXT = "text"
    BINARY = "binary"
    STREAM = "stream"
    GRAPHQL = "graphql"
    PROTOBUF = "protobuf"
    MSGPACK = "msgpack"
    CUSTOM = "custom"


class SpecQueryOperator(StrEnum):
    """Normalized field query operators."""

    EQ = "eq"
    NEQ = "neq"
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    GT = "gt"
    GTE = "gte"
    LT = "lt"
    LTE = "lte"
    BETWEEN = "between"
    EXISTS = "exists"


class SpecVisibilityLevel(StrEnum):
    """Normalized field visibility levels."""

    PUBLIC = "public"
    INTERNAL = "internal"
    SECRET = "secret"
    AUTH = "auth"


class SpecPersistenceMode(StrEnum):
    """Normalized persistence modes."""

    STORED = "stored"
    VIRTUAL = "virtual"
    COMPUTED = "computed"


class SpecRelationKind(StrEnum):
    """Normalized entity relation kinds."""

    BELONGS_TO = "belongs_to"
    HAS_ONE = "has_one"
    HAS_MANY = "has_many"
    MANY_TO_MANY = "many_to_many"


class SpecSecurityCredentialSource(StrEnum):
    """Normalized security credential locations."""

    HEADER = "header"
    COOKIE = "cookie"
    QUERY = "query"


class SpecSecurityCredentialFormat(StrEnum):
    """Normalized security credential formats."""

    RAW = "raw"
    BEARER = "bearer"
    BASIC = "basic"
    API_KEY = "api_key"
    SESSION = "session"


class SpecSecurityPolicyMode(StrEnum):
    """Normalized security policy modes."""

    PUBLIC = "public"
    PROTECTED = "protected"


class SpecHttpMethod(StrEnum):
    """Normalized HTTP methods."""

    GET = "get"
    POST = "post"
    PUT = "put"
    PATCH = "patch"
    DELETE = "delete"
    OPTIONS = "options"
    HEAD = "head"


class SpecUrlEnv(StrEnum):
    """Normalized URL environments."""

    LOCAL = "local"
    DEVELOPMENT = "development"
    PREVIEW = "preview"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


class SpecUrlKind(StrEnum):
    """Normalized URL kinds."""

    API = "api"
    WEBSITE = "website"
    ADMIN = "admin"
    DOCS = "docs"
    ASSETS = "assets"
    CDN = "cdn"
    WEBSOCKET = "websocket"
    WEBHOOK = "webhook"
    AUTH = "auth"
    CUSTOM = "custom"


class SpecUrlProtocol(StrEnum):
    """Normalized URL protocols."""

    HTTP = "http"
    HTTPS = "https"
    WS = "ws"
    WSS = "wss"


@dataclass(frozen=True)
class SpecRef:
    """Normalized portable spec reference."""

    value: str
    target_kind: SpecRecordKind | None = None


@dataclass(frozen=True)
class SpecIdentity:
    """Parsed identity metadata from a compiled record key.

    Dot notation is not a filesystem path. It is identity metadata.

    Example:
        entity.user.nickname
        owner_identity = entity
        owner_key = user
        local_key = nickname
    """

    raw: str
    local_key: str
    owner_identity: str | None = None
    owner_key: str | None = None


@dataclass(frozen=True)
class SpecName:
    """Prepared naming variants for a normalized spec item."""

    raw: str
    clean: str
    pascal: str
    camel: str
    snake: str
    kebab: str
    screaming_snake: str
    constant: str
    path: str
    plural: str | None = None
    singular: str | None = None


@dataclass(frozen=True)
class SpecDefinitionMeta:
    """Common metadata available on normalized definition items."""

    description: str | None = None
    deprecated: bool = False
    meta: dict[str, Any] | None = None
    ownership: SpecRef | None = None


@dataclass(frozen=True)
class SpecFileMetadata:
    """Source file metadata for the loaded compiled spec."""

    path: Path
    size_bytes: int
    size_label: str
    line_count: int


@dataclass(frozen=True)
class SpecProjectMetadata:
    """Project/API metadata from the compiled spec root."""

    codepot_version: str
    project_key: str
    spec_version: int
    title: str
    api_version: str
    summary: str | None
    terms_of_service: str | None


@dataclass(frozen=True)
class SpecContact:
    """Normalized API contact metadata."""

    name: str | None
    url: str | None
    email: str | None


@dataclass(frozen=True)
class SpecLicense:
    """Normalized API license metadata."""

    name: str
    identifier: str | None
    url: str | None


@dataclass(frozen=True)
class SpecInfoLinks:
    """Normalized project information links."""

    website: str | None
    docs: str | None
    support: str | None
    changelog: str | None
    status: str | None
    repository: str | None


@dataclass(frozen=True)
class SpecMetadata:
    """Complete normalized metadata for a compiled spec."""

    file: SpecFileMetadata
    project: SpecProjectMetadata
    contact: SpecContact | None
    license: SpecLicense | None
    links: SpecInfoLinks | None


@dataclass(frozen=True)
class SpecCounts:
    """Precomputed counts from the normalized spec repository."""

    urls: int
    content_types: int

    primitives: int
    enums: int
    enum_values: int
    composites: int
    composite_fields: int

    entities: int
    entity_fields: int
    field_sets: int
    field_set_fields: int
    models: int
    model_fields: int
    dtos: int
    dto_fields: int
    params: int

    resources: int
    operations: int
    route_paths: int
    route_methods: int
    route_responses: int

    error_responses: int

    security_credentials: int
    security_principals: int
    security_policies: int

    properties_total: int
    schemas_total: int
    routes_total: int
    responses_total: int
    security_total: int
    records_total: int


@dataclass(frozen=True)
class SpecRecord:
    """Base normalized spec record."""

    kind: SpecRecordKind
    key: str
    ref: SpecRef
    identity: SpecIdentity
    name: SpecName
    definition: SpecDefinitionMeta
    owner: SpecRef | None = None


@dataclass(frozen=True)
class SpecUrl:
    """Normalized URL definition."""

    record: SpecRecord
    kind: SpecUrlKind
    env: SpecUrlEnv
    uri: str
    protocol: SpecUrlProtocol | None
    base_path: str | None
    label: str | None


@dataclass(frozen=True)
class SpecContentType:
    """Normalized reusable content type definition."""

    record: SpecRecord
    media_type: str
    strategy: SpecContentStrategy
    binary: bool
    structured: bool


@dataclass(frozen=True)
class SpecPrimitiveValidation:
    """Normalized primitive validation constraints."""

    minimum: float | None
    maximum: float | None
    exclusive_minimum: float | None
    exclusive_maximum: float | None
    multiple_of: float | None
    min_length: int | None
    max_length: int | None
    pattern: str | None


@dataclass(frozen=True)
class SpecPrimitive:
    """Normalized reusable primitive property."""

    record: SpecRecord
    type: SpecPrimitiveType
    format: SpecPrimitiveFormat | None
    validation: SpecPrimitiveValidation | None
    example: Any | None


@dataclass(frozen=True)
class SpecEnumValue:
    """Normalized enum value."""

    record: SpecRecord
    value: str | int | float
    label: str | None


@dataclass(frozen=True)
class SpecEnum:
    """Normalized reusable enum property."""

    record: SpecRecord
    values: tuple[SpecEnumValue, ...]
    resource: SpecRef | None
    entity: SpecRef | None


@dataclass(frozen=True)
class SpecCompositeField:
    """Normalized composite field."""

    record: SpecRecord
    property_ref: SpecRef


@dataclass(frozen=True)
class SpecComposite:
    """Normalized reusable composite property."""

    record: SpecRecord
    extends: SpecRef | None
    fields: tuple[SpecCompositeField, ...]
    resource: SpecRef | None
    entity: SpecRef | None


@dataclass(frozen=True)
class SpecFieldCapability:
    """Normalized field query/sort/select capability."""

    filter: bool
    sort: bool
    select: bool
    operators: tuple[SpecQueryOperator, ...]


@dataclass(frozen=True)
class SpecFieldVisibility:
    """Normalized field read/write visibility."""

    read: SpecVisibilityLevel | None
    write: SpecVisibilityLevel | None
    sensitive: bool


@dataclass(frozen=True)
class SpecFieldLifecycle:
    """Normalized field lifecycle behavior."""

    create: bool | None
    update: bool | None
    immutable: bool
    generated: bool
    read_only: bool


@dataclass(frozen=True)
class SpecFieldPersistence:
    """Normalized field persistence behavior."""

    mode: SpecPersistenceMode | None
    generated: bool
    immutable: bool


@dataclass(frozen=True)
class SpecArray:
    """Normalized array behavior."""

    enabled: bool
    min_items: int | None
    max_items: int | None
    unique_items: bool


@dataclass(frozen=True)
class SpecRelationThrough:
    """Normalized many-to-many through relation metadata."""

    entity: SpecRef
    from_field: SpecRef
    to_field: SpecRef


@dataclass(frozen=True)
class SpecRelation:
    """Normalized relation metadata for an entity field."""

    kind: SpecRelationKind
    target: SpecRef
    inverse: SpecRef | None
    through: SpecRelationThrough | None


@dataclass(frozen=True)
class SpecFieldOptions:
    """Normalized field options common to schemas, models, and DTOs."""

    required: bool
    nullable: bool
    default: Any | None
    array: SpecArray | None
    capability: SpecFieldCapability | None
    visibility: SpecFieldVisibility | None
    lifecycle: SpecFieldLifecycle | None
    persistence: SpecFieldPersistence | None


@dataclass(frozen=True)
class SpecEntityField:
    """Normalized entity-owned field."""

    record: SpecRecord
    kind: SpecFieldKind
    options: SpecFieldOptions
    property_ref: SpecRef | None
    relation: SpecRelation | None


@dataclass(frozen=True)
class SpecEntity:
    """Normalized entity schema."""

    record: SpecRecord
    resource: SpecRef | None
    tags: tuple[str, ...]
    extends: SpecRef | None
    abstract: bool
    fields: tuple[SpecEntityField, ...]


@dataclass(frozen=True)
class SpecFieldSet:
    """Normalized field set schema."""

    record: SpecRecord
    fields: tuple[SpecRef, ...]


@dataclass(frozen=True)
class SpecModelFieldSets:
    """Normalized model-linked field set refs."""

    select: SpecRef | None
    sort: SpecRef | None
    filter: SpecRef | None
    create: SpecRef | None
    update: SpecRef | None
    relations: SpecRef | None


@dataclass(frozen=True)
class SpecModelField:
    """Normalized model field."""

    record: SpecRecord
    kind: SpecFieldKind
    ref: SpecRef | None
    items: SpecRef | None
    options: SpecFieldOptions


@dataclass(frozen=True)
class SpecModel:
    """Normalized model schema."""

    record: SpecRecord
    source: SpecRef
    extends: SpecRef | None
    partial: bool
    field_sets: SpecModelFieldSets | None
    fields: tuple[SpecModelField, ...]


@dataclass(frozen=True)
class SpecDtoField:
    """Normalized DTO field."""

    record: SpecRecord
    kind: SpecFieldKind
    ref: SpecRef | None
    items: SpecRef | None
    options: SpecFieldOptions


@dataclass(frozen=True)
class SpecDto:
    """Normalized DTO schema."""

    record: SpecRecord
    source: SpecRef | None
    extends: SpecRef | None
    partial: bool
    fields: tuple[SpecDtoField, ...]


@dataclass(frozen=True)
class SpecParams:
    """Normalized params schema."""

    record: SpecRecord
    ref: SpecRef


@dataclass(frozen=True)
class SpecSecurityCredential:
    """Normalized security credential."""

    record: SpecRecord
    source: SpecSecurityCredentialSource
    key: str
    format: SpecSecurityCredentialFormat | None
    value_type: SpecRef | None


@dataclass(frozen=True)
class SpecSecurityPrincipal:
    """Normalized security principal."""

    record: SpecRecord
    fields: tuple[tuple[str, SpecRef], ...]


@dataclass(frozen=True)
class SpecSecurityPolicy:
    """Normalized security policy."""

    record: SpecRecord
    mode: SpecSecurityPolicyMode
    credential: SpecRef | None
    principals: tuple[tuple[str, SpecRef], ...]
    roles: tuple[str, ...]
    permissions: tuple[str, ...]
    intent: str | None


@dataclass(frozen=True)
class SpecErrorResponse:
    """Normalized reusable error response."""

    record: SpecRecord
    status: int
    intent: str | None
    schema: SpecRef
    content_type: SpecRef
    headers: tuple[tuple[str, SpecRef], ...]


@dataclass(frozen=True)
class SpecOperationInput:
    """Normalized operation input refs."""

    context: tuple[SpecRef, ...]
    params: SpecRef | None
    query: SpecRef | None
    body: SpecRef | None


@dataclass(frozen=True)
class SpecOperationOutput:
    """Normalized operation output refs."""

    result: SpecRef | None
    errors: tuple[SpecRef, ...]


@dataclass(frozen=True)
class SpecOperation:
    """Normalized resource operation."""

    record: SpecRecord
    resource: SpecRef
    input: SpecOperationInput
    output: SpecOperationOutput


@dataclass(frozen=True)
class SpecRouteBody:
    """Normalized route request body."""

    schema: SpecRef
    content_type: SpecRef
    content_types: tuple[SpecRef, ...]


@dataclass(frozen=True)
class SpecRouteInlineResponse:
    """Normalized inline route response."""

    status: int | None
    schema: SpecRef | None
    content_type: SpecRef | None
    content_types: tuple[SpecRef, ...]
    headers: tuple[tuple[str, SpecRef], ...]


@dataclass(frozen=True)
class SpecRouteResponse:
    """Normalized route response."""

    record: SpecRecord
    status: int | None
    error_response: SpecRef | None
    inline: SpecRouteInlineResponse | None


@dataclass(frozen=True)
class SpecRouteMethod:
    """Normalized route method binding."""

    record: SpecRecord
    resource: SpecRef
    route_path: SpecRef
    method: SpecHttpMethod
    operation: SpecRef
    security: SpecRef | SpecSecurityPolicy | None
    params: SpecRef | None
    query: SpecRef | None
    body: SpecRouteBody | None
    responses: tuple[SpecRouteResponse, ...]


@dataclass(frozen=True)
class SpecRoutePath:
    """Normalized route path."""

    record: SpecRecord
    resource: SpecRef
    path: str
    parameters: tuple[tuple[str, SpecRef], ...]
    methods: tuple[SpecRouteMethod, ...]


@dataclass(frozen=True)
class SpecResourceDefaults:
    """Normalized resource defaults."""

    security: SpecRef | None


@dataclass(frozen=True)
class SpecResource:
    """Normalized API resource."""

    record: SpecRecord
    base_path: str
    folders: tuple[str, ...]
    defaults: SpecResourceDefaults
    operations: tuple[SpecOperation, ...]
    routes: tuple[SpecRoutePath, ...]


@dataclass(frozen=True)
class SpecContext:
    """Complete normalized spec context exposed by the spec repository."""

    metadata: SpecMetadata
    counts: SpecCounts

    urls: tuple[SpecUrl, ...]
    content_types: tuple[SpecContentType, ...]

    primitives: tuple[SpecPrimitive, ...]
    enums: tuple[SpecEnum, ...]
    composites: tuple[SpecComposite, ...]

    entities: tuple[SpecEntity, ...]
    field_sets: tuple[SpecFieldSet, ...]
    models: tuple[SpecModel, ...]
    dtos: tuple[SpecDto, ...]
    params: tuple[SpecParams, ...]

    resources: tuple[SpecResource, ...]
    error_responses: tuple[SpecErrorResponse, ...]

    security_credentials: tuple[SpecSecurityCredential, ...]
    security_principals: tuple[SpecSecurityPrincipal, ...]
    security_policies: tuple[SpecSecurityPolicy, ...]

    all_records: tuple[SpecRecord, ...]
