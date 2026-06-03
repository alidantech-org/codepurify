"""Template package validator."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from contracts.templates.config.package import LoadedTemplatePackageConfig
from pipeline.templates.refs import validate_template_ref
from pipeline.templates.selection import validate_template_select


@dataclass(frozen=True)
class TemplateValidationError:
    """One template validation error."""

    template_id: str | None
    message: str


@dataclass(frozen=True)
class TemplateValidationWarning:
    """One template validation warning."""

    template_id: str | None
    message: str


@dataclass(frozen=True)
class TemplateValidationResult:
    """Template package validation result."""

    errors: tuple[TemplateValidationError, ...]
    warnings: tuple[TemplateValidationWarning, ...]

    @property
    def is_valid(self) -> bool:
        """Return true when no validation errors exist."""

        return not self.errors


def _template_file_exists(
    *,
    package_path: Path,
    relative_path: str,
) -> bool:
    """Return true when a template package file exists."""

    return (package_path / relative_path).is_file()


def validate_template_package(
    package: LoadedTemplatePackageConfig,
) -> TemplateValidationResult:
    """Validate loaded template package config."""

    errors: list[TemplateValidationError] = []
    warnings: list[TemplateValidationWarning] = []

    config = package.config

    for template_id, template in config.templates.items():
        try:
            validate_template_select(template.select)
        except ValueError as error:
            errors.append(
                TemplateValidationError(
                    template_id=template_id,
                    message=str(error),
                )
            )

        if template.template is not None and not _template_file_exists(
            package_path=package.package_path,
            relative_path=template.template,
        ):
            errors.append(
                TemplateValidationError(
                    template_id=template_id,
                    message=f"Template file does not exist: {template.template}",
                )
            )

        if template.copy_file is not None and not _template_file_exists(
            package_path=package.package_path,
            relative_path=template.copy_file,
        ):
            errors.append(
                TemplateValidationError(
                    template_id=template_id,
                    message=f"Static copy file does not exist: {template.copy_file}",
                )
            )

        for subject, resolver in template.resolves.items():
            try:
                validate_template_ref(value=resolver.ref, config=config)
            except ValueError as error:
                errors.append(
                    TemplateValidationError(
                        template_id=template_id,
                        message=f"Invalid resolver for {subject}: {error}",
                    )
                )

        if template.barrel is not None and not _template_file_exists(
            package_path=package.package_path,
            relative_path=template.barrel.template,
        ):
            errors.append(
                TemplateValidationError(
                    template_id=template_id,
                    message=f"Barrel template file does not exist: {template.barrel.template}",
                )
            )

        if not template.output.paths:
            errors.append(
                TemplateValidationError(
                    template_id=template_id,
                    message="Template output must define at least one path.",
                )
            )

    if not config.templates:
        warnings.append(
            TemplateValidationWarning(
                template_id=None,
                message="Template package contains no templates.",
            )
        )

    return TemplateValidationResult(
        errors=tuple(errors),
        warnings=tuple(warnings),
    )
