from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from constants.openapi import (
    COMPONENTS,
    COMP_PARAMETERS,
    COMP_REQUEST_BODIES,
    COMP_RESPONSES,
    COMP_SCHEMAS,
    DEFAULT_TITLE,
    INFO,
    OPENAPI,
    PATHS,
    TITLE,
    VERSION,
)

OpenApiDict = dict[str, Any]


@dataclass(frozen=True)
class OpenApiDocument:
    path: Path
    raw: OpenApiDict

    @property
    def openapi_version(self) -> str:
        return str(self.raw.get(OPENAPI, ""))

    @property
    def info(self) -> OpenApiDict:
        value = self.raw.get(INFO)
        return value if isinstance(value, dict) else {}

    @property
    def title(self) -> str:
        return str(self.info.get(TITLE, DEFAULT_TITLE))

    @property
    def api_version(self) -> str:
        return str(self.info.get(VERSION, ""))

    @property
    def paths(self) -> OpenApiDict:
        value = self.raw.get(PATHS)
        return value if isinstance(value, dict) else {}

    @property
    def components(self) -> OpenApiDict:
        value = self.raw.get(COMPONENTS)
        return value if isinstance(value, dict) else {}

    @property
    def schemas(self) -> OpenApiDict:
        value = self.components.get(COMP_SCHEMAS)
        return value if isinstance(value, dict) else {}

    @property
    def responses(self) -> OpenApiDict:
        value = self.components.get(COMP_RESPONSES)
        return value if isinstance(value, dict) else {}

    @property
    def request_bodies(self) -> OpenApiDict:
        value = self.components.get(COMP_REQUEST_BODIES)
        return value if isinstance(value, dict) else {}

    @property
    def parameters(self) -> OpenApiDict:
        value = self.components.get(COMP_PARAMETERS)
        return value if isinstance(value, dict) else {}
