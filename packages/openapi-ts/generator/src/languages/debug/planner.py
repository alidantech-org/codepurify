"""Debug language planner for text report emission."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from emission.model import TemplateContext
from emission.planning import RenderContexts
from utils.naming import build_name


class DebugLanguagePlanner:
    """Build template contexts for debug text output."""

    language = "debug"

    def build_render_contexts(
        self,
        *,
        graph: Any | None,
        output_path: Path | None = None,
    ) -> RenderContexts:
        """Build debug contexts from an inference graph."""
        if graph is None:
            return self._empty_contexts()

        package = {"name": build_name("debug")}
        version = "debug"

        resources = tuple(self._resource_context(item, package, version) for item in self._items(graph, "resources"))

        schemas = tuple(self._schema_context(item, package, version) for item in self._items(graph, "schemas"))

        operations = tuple(self._operation_context(item, package, version) for item in self._items(graph, "operations"))

        return RenderContexts(
            global_context=TemplateContext(
                {
                    "language": self.language,
                    "package": package,
                    "version": version,
                    "graph": {
                        "resources_count": len(resources),
                        "schemas_count": len(schemas),
                        "operations_count": len(operations),
                    },
                    "debug": {
                        "title": "OpenAPI Inference Debug Report",
                    },
                }
            ),
            resources=resources,
            schemas=schemas,
            operations=operations,
        )

    def _empty_contexts(self) -> RenderContexts:
        return RenderContexts(
            global_context=TemplateContext(
                {
                    "language": self.language,
                    "package": {"name": build_name("debug")},
                    "version": "debug",
                    "graph": {
                        "resources_count": 0,
                        "schemas_count": 0,
                        "operations_count": 0,
                    },
                    "debug": {
                        "title": "OpenAPI Inference Debug Report",
                    },
                }
            )
        )

    def _resource_context(
        self,
        resource: Any,
        package: dict[str, Any],
        version: str,
    ) -> TemplateContext:
        name = self._name(resource, "name", "resource_name", default="resource")

        return TemplateContext(
            {
                "language": self.language,
                "package": package,
                "version": version,
                "resource": {
                    "name": build_name(name),
                    "raw": resource,
                    "path": self._value(resource, "path", "base_path", default="-"),
                    "schemas": self._names(self._items(resource, "schemas")),
                    "operations": self._names(self._items(resource, "operations")),
                },
                "debug": {
                    "kind": "resource",
                },
            }
        )

    def _schema_context(
        self,
        schema: Any,
        package: dict[str, Any],
        version: str,
    ) -> TemplateContext:
        name = self._name(schema, "name", "schema_name", "component_name", default="schema")

        return TemplateContext(
            {
                "language": self.language,
                "package": package,
                "version": version,
                "schema": {
                    "name": build_name(name),
                    "raw": schema,
                    "kind": self._value(schema, "kind", "schema_kind", default="-"),
                    "ref": self._value(schema, "ref", "schema_ref", default="-"),
                    "resource": self._safe_name(self._value(schema, "resource", default=None)),
                    "fields": [self._field_context(item) for item in self._items(schema, "fields")],
                },
                "debug": {
                    "kind": "schema",
                },
            }
        )

    def _operation_context(
        self,
        operation: Any,
        package: dict[str, Any],
        version: str,
    ) -> TemplateContext:
        name = self._name(operation, "operation_id", "id", "name", default="operation")

        return TemplateContext(
            {
                "language": self.language,
                "package": package,
                "version": version,
                "operation": {
                    "name": build_name(name),
                    "raw": operation,
                    "id": name,
                    "method": self._value(operation, "method", default="-"),
                    "path": self._value(operation, "path", default="-"),
                    "resource": self._safe_name(self._value(operation, "resource", default=None)),
                    "parameters": [self._parameter_context(item) for item in self._items(operation, "parameters")],
                    "request_body": self._request_body_context(self._value(operation, "request_body", default=None)),
                    "responses": [self._response_context(item) for item in self._items(operation, "responses")],
                },
                "debug": {
                    "kind": "operation",
                },
            }
        )

    def _field_context(self, field: Any) -> dict[str, Any]:
        return {
            "name": self._value(field, "name", "field_name", default="-"),
            "type": self._value(field, "type", "type_name", "schema_type", default="-"),
            "required": self._value(field, "required", default=False),
            "ref": self._value(field, "ref", "schema_ref", default="-"),
        }

    def _parameter_context(self, parameter: Any) -> dict[str, Any]:
        return {
            "name": self._value(parameter, "name", "parameter_name", default="-"),
            "location": self._value(parameter, "location", "in_", "param_in", default="-"),
            "required": self._value(parameter, "required", default=False),
            "ref": self._value(parameter, "ref", default="-"),
            "schema_ref": self._value(parameter, "schema_ref", default="-"),
        }

    def _request_body_context(self, request_body: Any) -> dict[str, Any] | None:
        if request_body is None:
            return None

        return {
            "required": self._value(request_body, "required", default=False),
            "ref": self._value(request_body, "ref", default="-"),
            "content_types": self._items(request_body, "content_types"),
            "schema_refs": self._items(request_body, "schema_refs"),
        }

    def _response_context(self, response: Any) -> dict[str, Any]:
        return {
            "status_code": self._value(response, "status_code", "status", default="-"),
            "description": self._value(response, "description", default="-"),
            "ref": self._value(response, "ref", default="-"),
            "content_types": self._items(response, "content_types"),
            "schema_refs": self._items(response, "schema_refs"),
            "is_success": self._value(response, "is_success", default=False),
            "is_error": self._value(response, "is_error", default=False),
        }

    def _items(self, value: Any, name: str) -> list[Any]:
        result = getattr(value, name, [])

        if result is None:
            return []

        if isinstance(result, dict):
            return list(result.values())

        if isinstance(result, list | tuple | set):
            return list(result)

        return []

    def _names(self, values: list[Any]) -> list[str]:
        return [self._safe_name(value) for value in values]

    def _name(self, value: Any, *names: str, default: str) -> str:
        result = self._value(value, *names, default=default)
        return str(result or default)

    def _value(self, value: Any, *names: str, default: Any = "") -> Any:
        if value is None:
            return default

        for name in names:
            if hasattr(value, name):
                result = getattr(value, name)
                return default if result is None else result

        return default

    def _safe_name(self, value: Any) -> str:
        if value is None:
            return "-"

        for name in ("name", "resource_name", "schema_name", "operation_id", "id"):
            if hasattr(value, name):
                result = getattr(value, name)
                return str(result) if result is not None else "-"

        return str(value)
