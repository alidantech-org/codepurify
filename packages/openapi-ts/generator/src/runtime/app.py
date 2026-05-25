from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from core.logging import debug, key_value_table, step, success


class GeneratorApp:
    def __init__(self, context: RuntimeContext) -> None:
        self.context = context

    def inspect(self, input_path: Path) -> None:
        from openapi.inspector import inspect_openapi_document
        from openapi.loader import load_openapi_document

        debug(f"Inspect input: {input_path}", self.context.options.debug)

        with step("Loading OpenAPI document"):
            document = load_openapi_document(input_path)

        with step("Inspecting document"):
            inspection = inspect_openapi_document(document)

        key_value_table(
            "OpenAPI Summary",
            [
                ("Title", inspection.title),
                ("OpenAPI", inspection.openapi_version),
                ("API Version", inspection.api_version),
                ("Paths", inspection.path_count),
                ("Operations", inspection.operation_count),
                ("Schemas", inspection.schema_count),
                ("Responses", inspection.response_count),
                ("Request Bodies", inspection.request_body_count),
                ("Parameters", inspection.parameter_count),
                ("Refs", inspection.ref_count),
                ("Component Refs", inspection.component_ref_count),
                ("Missing Component Refs", inspection.missing_component_ref_count),
            ],
        )

        if inspection.resources:
            rows = [
                (
                    resource.name,
                    "/".join(resource.path) if resource.path else "-",
                    resource.operation_count,
                )
                for resource in inspection.resources
            ]

            from rich.table import Table
            from core.logging import console

            table = Table(title="Detected Resources", show_header=True, header_style="bold cyan")
            table.add_column("Resource")
            table.add_column("Path")
            table.add_column("Operations")

            for name, path, count in rows:
                table.add_row(str(name), str(path), str(count))

            console.print(table)

        success("OpenAPI inspection completed")

    def infer(self, input_path: Path, output_path: Path | None = None) -> None:
        from collections import Counter

        from inference.engine import InferenceEngine
        from openapi.loader import load_openapi_document

        debug(f"Infer input: {input_path}", self.context.options.debug)
        debug(f"Infer output: {output_path}", self.context.options.debug)

        with step("Loading OpenAPI document"):
            document = load_openapi_document(input_path)

        with step("Running inference engine"):
            graph = InferenceEngine().infer(document)

        kind_counts = Counter(schema.kind.value for schema in graph.schemas)
        alias_schemas = [schema for schema in graph.schemas if schema.is_alias]

        rows = [
            ("Title", graph.title),
            ("OpenAPI", graph.openapi_version),
            ("API Version", graph.api_version),
            ("Resources", len(graph.resources)),
            ("Schemas", len(graph.schemas)),
            ("Operations", len(graph.operations)),
            ("Dependencies", len(graph.dependencies)),
            ("Alias Schemas", len(alias_schemas)),
        ]

        for kind, count in sorted(kind_counts.items()):
            rows.append((f"Schema Kind: {kind}", count))

        key_value_table("Inference Summary", rows)

        unknown_schemas = [schema for schema in graph.schemas if schema.kind.value == "unknown"]

        if unknown_schemas:
            from rich.table import Table
            from core.logging import console, warning

            warning("Unknown schemas detected. These need classifier improvement.")

            table = Table(title="Unknown Schemas", show_header=True, header_style="bold yellow")
            table.add_column("Name")
            table.add_column("Ref")
            table.add_column("x-codegen.kind")
            table.add_column("Keys")

            for schema in unknown_schemas:
                table.add_row(
                    schema.name,
                    schema.ref,
                    str(schema.x_codegen.get("kind", "-")),
                    ", ".join(sorted(schema.raw.keys())),
                )

            console.print(table)

        if alias_schemas:
            from rich.table import Table
            from core.logging import console

            table = Table(title="Alias Schemas", show_header=True, header_style="bold cyan")
            table.add_column("Name")
            table.add_column("Kind")
            table.add_column("Alias Of")
            table.add_column("Resource")

            for schema in alias_schemas:
                table.add_row(
                    schema.name,
                    schema.kind.value,
                    schema.alias_of or "-",
                    schema.resource.name if schema.resource else "-",
                )

            console.print(table)

        if output_path is not None:
            import json

            from inference.serialization import inference_graph_to_dict

            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(
                json.dumps(inference_graph_to_dict(graph), indent=2, default=str),
                encoding="utf-8",
            )

            success(f"Wrote inference graph: {output_path}")

        success("Inference completed")

    def emit(
        self,
        input_path: Path,
        language: str,
        output_path: Path,
    ) -> None:
        from emission.writer import FileWriter
        from inference.engine import InferenceEngine
        from openapi.loader import load_openapi_document
        from runtime.registry import create_language_emitter

        debug(f"Emit input: {input_path}", self.context.options.debug)
        debug(f"Emit language: {language}", self.context.options.debug)
        debug(f"Emit output: {output_path}", self.context.options.debug)

        with step("Loading OpenAPI document"):
            document = load_openapi_document(input_path)

        with step("Running inference engine"):
            graph = InferenceEngine().infer(document)

        with step(f"Creating {language} emission plan"):
            emitter = create_language_emitter(language)
            plan = emitter.emit(graph)

        with step("Writing emitted files"):
            result = FileWriter().write_plan(
                plan=plan,
                output_root=output_path,
                dry_run=self.context.options.dry_run,
            )

        key_value_table(
            "Emission Summary",
            [
                ("Language", plan.language),
                ("Files", len(plan.files)),
                ("Created", result.created),
                ("Updated", result.updated),
                ("Unchanged", result.unchanged),
                ("Skipped", result.skipped),
                ("Output", output_path),
            ],
        )

        success("Emission completed")

    def validate(self, input_path: Path) -> None:
        debug(f"Validate input: {input_path}", self.context.options.debug)

        with step("Validating OpenAPI document"):
            # TODO: load OpenAPI
            # TODO: validate required keys and supported shapes
            pass

        success("Validate command pipeline is wired")
