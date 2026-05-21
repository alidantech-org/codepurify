"""Route planning models for Dart SDK generation."""

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DartEndpointOperationPlan:
    """Plan for one endpoint constant/getter/method."""

    operation_id: str
    method_name: str
    path: str
    path_params: list[str]
    summary: str | None

    # True when endpoint can be generated as a getter.
    # False when endpoint needs path params and must be generated as a method.
    is_getter: bool

    # Dart method parameter signature for path params.
    params_signature: str

    # Dart endpoint string expression.
    # For static paths: "'/users'"
    # For dynamic paths: "'/users/' + userId"
    endpoint_expression: str


@dataclass(frozen=True)
class DartEndpointGroupPlan:
    """Plan for one tag-based endpoint constants class."""

    group_name: str
    class_name: str
    property_name: str
    folder: Path
    file_name: str
    operations: list[DartEndpointOperationPlan]


@dataclass(frozen=True)
class DartRouteVersionPlan:
    """Plan for one route version folder/file."""

    version_name: str
    class_name: str
    folder: Path
    file_name: str
    imports: list[str]
    endpoint_groups: list[DartEndpointGroupPlan]
