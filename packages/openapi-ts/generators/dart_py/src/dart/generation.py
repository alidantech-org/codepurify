"""
Dart SDK generation orchestration.

This module owns Dart-specific generation flow:
- build Dart generation plans
- validate plans
- render generated Dart files
- run Dart formatting/tooling

This module must not:
- parse CLI arguments
- load OpenAPI files
- generate docs
"""

from config import GeneratorConfig
from logger import console
from dart.planning.plan_registry import build_dart_plans
from dart.planning.validator import validate_generation_plan
from dart.render.renderer import (
    render_barrel,
    render_class,
    render_endpoint_group,
    render_enum,
    render_feature,
    render_fields,
    render_route_version,
)


def generate_dart_sdk(
    spec: dict,
    config: GeneratorConfig,
) -> None:
    """Generate all Dart SDK outputs using the unified planning layer."""
    plan = build_dart_plans(spec, config.package_name)
    validate_generation_plan(plan)

    render_enum_plans(plan, config)
    render_class_plans(plan, config)
    render_barrel_plans(plan, config)
    render_route_plans(plan, config)
    render_feature_plans(plan, config)

    run_post_generation_steps(config)


def render_enum_plans(plan, config: GeneratorConfig) -> None:
    """Render enum plans."""
    if not plan.enums:
        return

    console.print(f"[green]Generating {len(plan.enums)} enum(s)[/green]")

    for enum_plan in plan.enums.values():
        render_enum(enum_plan, config.dart_output, config.dry_run)

    console.print(f"[green]Enums generated:[/green] [cyan]{config.dart_output}[/cyan]")


def render_class_plans(plan, config: GeneratorConfig) -> None:
    """Render class and fields plans."""
    if not plan.classes:
        return

    console.print(f"[green]Generating {len(plan.classes)} class(es)[/green]")

    for class_plan in plan.classes.values():
        render_class(class_plan, config.dart_output, config.dry_run)
        render_fields(class_plan, config.dart_output, config.dry_run)

    console.print(f"[green]Classes generated:[/green] [cyan]{config.dart_output}[/cyan]")


def render_barrel_plans(plan, config: GeneratorConfig) -> None:
    """Render barrel plans."""
    if not plan.barrels:
        return

    console.print(f"[green]Generating {len(plan.barrels)} barrel file(s)[/green]")

    for barrel_plan in plan.barrels:
        render_barrel(barrel_plan, config.dart_output, config.dry_run)

    console.print(f"[green]Barrels generated:[/green] [cyan]{config.dart_output}[/cyan]")


def render_route_plans(plan, config: GeneratorConfig) -> None:
    """Render route version and endpoint group plans."""
    if not plan.route_versions:
        return

    console.print(f"[green]Generating {len(plan.route_versions)} route version(s)[/green]")

    for version_plan in plan.route_versions:
        render_route_version(version_plan, config.dart_output, config.dry_run)

        for group in version_plan.endpoint_groups:
            render_endpoint_group(group, config.dart_output, config.dry_run)

    console.print(f"[green]Routes generated:[/green] [cyan]{config.dart_output}[/cyan]")


def render_feature_plans(plan, config: GeneratorConfig) -> None:
    """Render feature plans."""
    if not plan.features:
        return

    console.print(f"[green]Generating {len(plan.features)} feature(s)[/green]")

    for feature_plan in plan.features:
        render_feature(feature_plan, config.dart_output, config.dry_run)

    console.print(f"[green]Features generated:[/green] [cyan]{config.dart_output}[/cyan]")


def run_post_generation_steps(config: GeneratorConfig) -> None:
    """Run formatting and tooling after Dart generation."""
    if config.format and not config.dry_run:
        from cli.services.formatter import run_dart_format

        run_dart_format(config.dart_output, config.strict_format)

    if config.tooling and not config.dry_run:
        from cli.services.tooling import generate_tooling_files

        generate_tooling_files(config.dart_output, config.force_tooling)
