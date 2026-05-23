from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

CODEGEN_KEY = "x-codegen"


@dataclass(frozen=True)
class CodegenMetadata:
    kind: str | None = None
    resource: str | None = None
    group: str | None = None
    entity: str | None = None
    component: str | None = None
    property_name: str | None = None
    model: str | None = None
    behavior: str | None = None
    ref_id: str | None = None
    operation: str | None = None
    role: str | None = None
    status: str | None = None
    shared: bool = False
    skip: bool = False
    abstract: bool = False
    inherits: list[dict[str, Any]] = field(default_factory=list)
    source: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)

    @property
    def is_present(self) -> bool:
        return self.source is not None

    @property
    def is_skipped(self) -> bool:
        return self.skip or self.kind == "property"


def read_codegen_metadata(node: dict[str, Any] | None) -> CodegenMetadata:
    if not isinstance(node, dict):
        return CodegenMetadata()

    raw = node.get(CODEGEN_KEY)

    if isinstance(raw, dict):
        return CodegenMetadata(
            kind=raw.get("kind"),
            resource=raw.get("resource"),
            group=raw.get("group"),
            entity=raw.get("entity"),
            component=raw.get("component"),
            property_name=raw.get("property"),
            model=raw.get("model"),
            behavior=raw.get("behavior"),
            ref_id=raw.get("refId") or raw.get("ref_id"),
            operation=raw.get("operation"),
            role=raw.get("role"),
            status=str(raw["status"]) if raw.get("status") is not None else None,
            shared=bool(raw.get("shared", False)),
            skip=bool(raw.get("skip", False)),
            abstract=bool(raw.get("abstract", False)),
            inherits=raw.get("inherits") if isinstance(raw.get("inherits"), list) else [],
            source=CODEGEN_KEY,
            raw=raw,
        )

    return CodegenMetadata()
