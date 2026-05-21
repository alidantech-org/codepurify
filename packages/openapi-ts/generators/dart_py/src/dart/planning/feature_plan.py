"""Feature planning models for Dart SDK generation."""

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DartFeatureMethodPlan:
    """Plan for one generated feature method."""

    operation_id: str
    method_name: str
    http_method: str

    # Request wrapper class, e.g. GetRequest, PostRequest, PatchRequest.
    request_class: str

    # Response DTO class name.
    response_class: str

    # Route endpoint expression used by the request.
    endpoint_expr: str

    # Optional request expressions.
    body_expr: str | None
    query_expr: str | None
    params_expr: str | None

    # Feature request options.
    # All feature methods support headers/noAuth.
    supports_request_options: bool

    # Only GET methods support cache options.
    supports_cache_options: bool

    # Imports needed by this method.
    imports: list[str]

    # Full Dart method signature.
    signature: str


@dataclass(frozen=True)
class DartFeaturePlan:
    """Plan for one generated feature class, usually one per OpenAPI tag."""

    version_name: str
    group_name: str
    class_name: str
    provider_name: str
    folder: Path
    file_name: str
    imports: list[str]
    methods: list[DartFeatureMethodPlan]
