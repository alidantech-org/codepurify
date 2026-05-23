"""Package file renderer for Dart SDK.

This module renders package setup files like pubspec.yaml, README.md, etc.
These files are written to the package root, not under lib/.

All file contents come from Jinja templates or static template files.
Python only orchestrates rendering/copying and manages write-if-changed behavior.
"""

from pathlib import Path
from typing import Any

from jinja2 import Environment

from logger import console
from paths.project_paths import get_templates_dir


def write_if_changed(path: Path, content: str, dry_run: bool = False) -> str:
    """
    Write content to file only if it differs from existing content.

    Returns:
        "created" - file was created
        "updated" - file was updated (content changed)
        "unchanged" - file existed with identical content
        "dry_run" - dry run mode, no write performed
    """
    if dry_run:
        return "dry_run"

    path.parent.mkdir(parents=True, exist_ok=True)

    if path.exists():
        existing_content = path.read_text(encoding="utf-8")
        if existing_content == content:
            return "unchanged"
        else:
            path.write_text(content, encoding="utf-8")
            return "updated"
    else:
        path.write_text(content, encoding="utf-8")
        return "created"


def render_jinja_file(
    template_env: Environment,
    template_name: str,
    context: dict[str, Any],
    output_path: Path,
    dry_run: bool = False,
) -> str:
    """
    Render a Jinja template and write only if changed.

    Returns:
        Status from write_if_changed
    """
    template = template_env.get_template(template_name)
    content = template.render(**context)
    return write_if_changed(output_path, content, dry_run)


def copy_static_file(source_path: Path, output_path: Path, dry_run: bool = False) -> str:
    """
    Copy a static template file only if changed.

    Returns:
        Status from write_if_changed
    """
    if not source_path.exists():
        raise FileNotFoundError(f"Static template file not found: {source_path}")

    content = source_path.read_text(encoding="utf-8")
    return write_if_changed(output_path, content, dry_run)


def build_package_context(
    spec_info: dict[str, Any],
    package_name: str,
    package_version: str,
    version_folder: str,
    spec: dict[str, Any],
) -> dict[str, Any]:
    """
    Build context dictionary for package template rendering.

    Args:
        spec_info: OpenAPI spec info section
        package_name: Resolved package name from config/OpenAPI
        package_version: Package version
        version_folder: Version folder (e.g., "v1", "latest")
        spec: Full OpenAPI spec for extracting tags

    Returns:
        Context dictionary for Jinja templates
    """
    # Get server URLs
    servers = spec_info.get("servers", [])
    server_urls = [s.get("url", "https://api.example.com") for s in servers] if servers else ["https://api.example.com"]

    # Get tags from spec
    tags = [tag.get("name", "default") for tag in spec.get("tags", [])]

    return {
        "metadata": {
            "name": package_name,
            "title": spec_info.get("title", "API SDK"),
            "description": spec_info.get("description", "Auto-generated Dart SDK"),
            "version": package_version,
            "servers": server_urls,
        },
        "paths": {
            "version_folder": version_folder,
        },
        "tags": tags,
    }


def render_package_files(
    template_env: Environment,
    package_root: Path,
    spec_info: dict[str, Any],
    package_name: str,
    package_version: str = "0.1.0",
    version_folder: str = "latest",
    spec: dict[str, Any] | None = None,
    dry_run: bool = False,
) -> None:
    """
    Render all package setup files to package root using templates.

    Args:
        template_env: Jinja2 environment
        package_root: Package root directory
        spec_info: OpenAPI spec info section
        package_name: Resolved package name
        package_version: Package version
        version_folder: Version folder
        spec: Full OpenAPI spec for extracting tags
        dry_run: If True, don't write files
    """
    console.print(f"[blue]Generating package files for:[/blue] [cyan]{package_root}[/cyan]")

    if spec is None:
        spec = {}

    context = build_package_context(spec_info, package_name, package_version, version_folder, spec)

    # Render dynamic templates
    pubspec_status = render_jinja_file(template_env, "package/pubspec.yaml.j2", context, package_root / "pubspec.yaml", dry_run)
    console.print(f"[green]{pubspec_status.capitalize()}:[/green] [cyan]pubspec.yaml[/cyan]")

    readme_status = render_jinja_file(template_env, "package/README.md.j2", context, package_root / "README.md", dry_run)
    console.print(f"[green]{readme_status.capitalize()}:[/green] [cyan]README.md[/cyan]")

    # Copy static files
    templates_dir = get_templates_dir()

    gitignore_status = copy_static_file(
        templates_dir / "package" / "gitignore.txt",
        package_root / ".gitignore",
        dry_run,
    )
    console.print(f"[green]{gitignore_status.capitalize()}:[/green] [cyan].gitignore[/cyan]")

    analysis_status = copy_static_file(
        templates_dir / "package" / "analysis_options.yaml",
        package_root / "analysis_options.yaml",
        dry_run,
    )
    console.print(f"[green]{analysis_status.capitalize()}:[/green] [cyan]analysis_options.yaml[/cyan]")

    vscode_dir = package_root / ".vscode"
    vscode_status = copy_static_file(
        templates_dir / "package" / "vscode_settings.json",
        vscode_dir / "settings.json",
        dry_run,
    )
    console.print(f"[green]{vscode_status.capitalize()}:[/green] [cyan].vscode/settings.json[/cyan]")

    # Render entry Dart files
    lib_root = package_root / "lib"

    root_entry_status = render_jinja_file(template_env, "dart/root_entry.dart.j2", context, lib_root / f"{package_name}.dart", dry_run)
    console.print(f"[green]{root_entry_status.capitalize()}:[/green] [cyan]lib/{package_name}.dart[/cyan]")

    version_entry_status = render_jinja_file(
        template_env, "dart/version_entry.dart.j2", context, lib_root / f"{version_folder}.dart", dry_run
    )
    console.print(f"[green]{version_entry_status.capitalize()}:[/green] [cyan]lib/{version_folder}.dart[/cyan]")

    latest_entry_status = render_jinja_file(template_env, "dart/latest_entry.dart.j2", context, lib_root / "latest.dart", dry_run)
    console.print(f"[green]{latest_entry_status.capitalize()}:[/green] [cyan]lib/latest.dart[/cyan]")
