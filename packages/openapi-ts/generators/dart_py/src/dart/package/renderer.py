"""
Dart package file renderer.

This module generates package-level files like pubspec.yaml, README.md, etc.
"""

from pathlib import Path
from typing import Any

from .metadata import DartPackageMetadata
from .paths import DartPackagePaths


def render_package_files(
    metadata: DartPackageMetadata,
    paths: DartPackagePaths,
    template_env: Any,
    force_overwrite: bool = False,
) -> None:
    """
    Render all package-level files.

    Args:
        metadata: Package metadata from OpenAPI spec.
        paths: Package path structure.
        template_env: Jinja2 template environment.
        force_overwrite: If True, overwrite existing package files.
    """
    # Ensure package root directories exist
    paths.package_root.mkdir(parents=True, exist_ok=True)
    paths.lib_root.mkdir(parents=True, exist_ok=True)
    paths.docs_root.mkdir(parents=True, exist_ok=True)
    paths.vscode_dir.mkdir(parents=True, exist_ok=True)

    # Render pubspec.yaml
    _render_file(
        template_env=template_env,
        template_name="package/pubspec.yaml.j2",
        output_path=paths.pubspec_file,
        context={"metadata": metadata},
        force_overwrite=force_overwrite,
    )

    # Render README.md
    _render_file(
        template_env=template_env,
        template_name="package/README.md.j2",
        output_path=paths.readme_file,
        context={"metadata": metadata},
        force_overwrite=force_overwrite,
    )

    # Render .gitignore
    _render_file(
        template_env=template_env,
        template_name="package/gitignore.txt",
        output_path=paths.gitignore_file,
        context={},
        force_overwrite=force_overwrite,
    )

    # Render analysis_options.yaml
    _render_file(
        template_env=template_env,
        template_name="package/analysis_options.yaml",
        output_path=paths.analysis_options_file,
        context={},
        force_overwrite=force_overwrite,
    )

    # Render .vscode/settings.json
    _render_file(
        template_env=template_env,
        template_name="package/vscode_settings.json",
        output_path=paths.vscode_settings_file,
        context={},
        force_overwrite=force_overwrite,
    )


def render_version_entry_files(
    metadata: DartPackageMetadata,
    paths: DartPackagePaths,
    template_env: Any,
) -> None:
    """
    Render version entry files (root, version, latest).

    Args:
        metadata: Package metadata from OpenAPI spec.
        paths: Package path structure.
        template_env: Jinja2 template environment.
    """
    # Render root entry file (lib/package_name.dart)
    _render_file(
        template_env=template_env,
        template_name="dart/root_entry.dart.j2",
        output_path=paths.root_entry_file,
        context={"metadata": metadata, "paths": paths},
        force_overwrite=True,
    )

    # Render version entry file (lib/v1.dart)
    _render_file(
        template_env=template_env,
        template_name="dart/version_entry.dart.j2",
        output_path=paths.version_entry_file,
        context={"metadata": metadata, "paths": paths},
        force_overwrite=True,
    )

    # Render latest entry file (lib/latest.dart)
    _render_file(
        template_env=template_env,
        template_name="dart/latest_entry.dart.j2",
        output_path=paths.latest_entry_file,
        context={"metadata": metadata, "paths": paths},
        force_overwrite=True,
    )

    # Render version index file (lib/v1/index.dart)
    _render_file(
        template_env=template_env,
        template_name="dart/version_index.dart.j2",
        output_path=paths.version_index_file,
        context={"metadata": metadata, "paths": paths},
        force_overwrite=True,
    )


def _render_file(
    template_env: Any,
    template_name: str,
    output_path: Path,
    context: dict[str, Any],
    force_overwrite: bool,
) -> None:
    """
    Render a single file from template.

    Args:
        template_env: Jinja2 template environment.
        template_name: Name of the template file.
        output_path: Path where the file should be written.
        context: Template context variables.
        force_overwrite: If True, overwrite existing file.
    """
    from ..render.file_writer import write_text_if_changed

    # Check if file exists and not forcing overwrite
    if output_path.exists() and not force_overwrite:
        return

    # Get template
    template = template_env.get_template(template_name)

    # Render content
    content = template.render(**context)

    # Write file using centralized writer
    write_text_if_changed(output_path, content, dry_run=False)
