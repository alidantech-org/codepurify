from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

OpenApiDict = dict[str, Any]


@dataclass(frozen=True)
class OpenApiDocument:
    path: Path
    raw: OpenApiDict

    @property
    def openapi_version(self) -> str:
        return str(self.raw.get("openapi", ""))

    @property
    def info(self) -> OpenApiDict:
        value = self.raw.get("info")
        return value if isinstance(value, dict) else {}

    @property
    def title(self) -> str:
        return str(self.info.get("title", "Untitled API"))

    @property
    def api_version(self) -> str:
        return str(self.info.get("version", ""))

    @property
    def paths(self) -> OpenApiDict:
        value = self.raw.get("paths")
        return value if isinstance(value, dict) else {}

    @property
    def components(self) -> OpenApiDict:
        value = self.raw.get("components")
        return value if isinstance(value, dict) else {}

    @property
    def schemas(self) -> OpenApiDict:
        value = self.components.get("schemas")
        return value if isinstance(value, dict) else {}

    @property
    def responses(self) -> OpenApiDict:
        value = self.components.get("responses")
        return value if isinstance(value, dict) else {}

    @property
    def request_bodies(self) -> OpenApiDict:
        value = self.components.get("requestBodies")
        return value if isinstance(value, dict) else {}

    @property
    def parameters(self) -> OpenApiDict:
        value = self.components.get("parameters")
        return value if isinstance(value, dict) else {}
