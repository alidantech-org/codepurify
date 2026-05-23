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

import shutil
from config import GeneratorConfig
from logger import console
from dart.package.version import resolve_api_version_folder
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
from dart.render.package_renderer import render_package_files
from paths.project_paths import get_templates_dir


def generate_dart_sdk(
    spec: dict,
    config: GeneratorConfig,
) -> None:
    """Generate all Dart SDK outputs using the unified planning layer."""
    version_folder = resolve_api_version_folder(spec)

    # Clean only the versioned lib folder if clean is enabled
    if config.clean and not config.dry_run:
        versioned_lib_path = config.lib_output / version_folder
        if versioned_lib_path.exists():
            shutil.rmtree(versioned_lib_path)
            console.print(f"[yellow]Cleaned versioned lib folder:[/yellow] [cyan]{versioned_lib_path}[/cyan]")

        # Clean old invalid root folders if they exist
        old_folders = ["models", "dtos", "enums", "features", "routes"]
        for folder in old_folders:
            old_path = config.lib_output / folder
            if old_path.exists():
                shutil.rmtree(old_path)
                console.print(f"[yellow]Cleaned old root folder:[/yellow] [cyan]{old_path}[/cyan]")

    plan = build_dart_plans(spec, config.package_name, version_folder)
    validate_generation_plan(plan)

    # Render package files to package root using templates
    from jinja2 import Environment, FileSystemLoader

    templates_dir = get_templates_dir()
    template_env = Environment(loader=FileSystemLoader(templates_dir))

    spec_info = spec.get("info", {})
    render_package_files(
        template_env,
        config.dart_output,
        spec_info,
        config.package_name,
        package_version="0.1.0",
        version_folder=version_folder,
        spec=spec,
        dry_run=config.dry_run,
    )

    render_enum_plans(plan, config, version_folder)
    render_class_plans(plan, config, version_folder)
    render_barrel_plans(plan, config, version_folder)
    render_route_plans(plan, config, version_folder)
    render_feature_plans(plan, config, version_folder)

    run_post_generation_steps(config)


def render_enum_plans(plan, config: GeneratorConfig, version_folder: str = "latest") -> None:
    """Render enum plans."""
    if not plan.enums:
        return

    console.print(f"[green]Generating {len(plan.enums)} enum(s)[/green]")

    for enum_plan in plan.enums.values():
        render_enum(enum_plan, config.lib_output, version_folder, config.dry_run)

    console.print(f"[green]Enums generated:[/green] [cyan]{config.lib_output}[/cyan]")


def render_class_plans(plan, config: GeneratorConfig, version_folder: str = "latest") -> None:
    """Render class and fields plans."""
    if not plan.classes:
        return

    console.print(f"[green]Generating {len(plan.classes)} class(es)[/green]")

    for class_plan in plan.classes.values():
        render_class(class_plan, config.lib_output, version_folder, config.dry_run)
        render_fields(class_plan, config.lib_output, version_folder, config.dry_run)

    console.print(f"[green]Classes generated:[/green] [cyan]{config.lib_output}[/cyan]")


def render_barrel_plans(plan, config: GeneratorConfig, version_folder: str = "latest") -> None:
    """Render barrel plans."""
    if not plan.barrels:
        return

    console.print(f"[green]Generating {len(plan.barrels)} barrel file(s)[/green]")

    for barrel_plan in plan.barrels:
        render_barrel(barrel_plan, config.lib_output, version_folder, config.dry_run)

    console.print(f"[green]Barrels generated:[/green] [cyan]{config.lib_output}[/cyan]")


def render_route_plans(plan, config: GeneratorConfig, version_folder: str = "latest") -> None:
    """Render route version and endpoint group plans."""
    if not plan.route_versions:
        return

    console.print(f"[green]Generating {len(plan.route_versions)} route version(s)[/green]")

    for version_plan in plan.route_versions:
        render_route_version(version_plan, config.lib_output, version_folder, config.dry_run)

        for group in version_plan.endpoint_groups:
            render_endpoint_group(group, config.lib_output, version_folder, config.dry_run)

    console.print(f"[green]Routes generated:[/green] [cyan]{config.lib_output}[/cyan]")


def render_feature_plans(plan, config: GeneratorConfig, version_folder: str = "latest") -> None:
    """Render feature plans."""
    if not plan.features:
        return

    console.print(f"[green]Generating {len(plan.features)} feature(s)[/green]")

    for feature_plan in plan.features:
        render_feature(feature_plan, config.lib_output, version_folder, config.dry_run)

    console.print(f"[green]Features generated:[/green] [cyan]{config.lib_output}[/cyan]")


def run_post_generation_steps(config: GeneratorConfig) -> None:
    """Run formatting and tooling after Dart generation."""
    if config.format and not config.dry_run:
        from dart.render.formatters import run_dart_format

        run_dart_format(config.dart_output, strict=config.strict_format)

    if config.format_non_dart and not config.dry_run:
        from dart.render.formatters import run_prettier

        run_prettier(config.dart_output, strict=config.strict_format)

    if config.tooling and not config.dry_run:
        from cli.services.tooling import generate_tooling_files

        generate_tooling_files(config.dart_output, config.force_tooling)
