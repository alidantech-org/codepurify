"""TypeScript naming helpers."""

from __future__ import annotations

from contracts.language.names import LanguageName
from contracts.spec.names import SpecName
from languages.typescript.constants import (
    RESERVED_WORD_ESCAPE_REASON,
    RESERVED_WORD_SUFFIX,
)
from languages.typescript.keywords import is_typescript_reserved
from languages.typescript.utils import get_case_value


def _escape(value: str) -> tuple[str, bool, str | None]:
    """Escape a TypeScript name if needed."""

    if is_typescript_reserved(value):
        return f"{value}{RESERVED_WORD_SUFFIX}", True, RESERVED_WORD_ESCAPE_REASON

    return value, False, None


def make_typescript_name(
    name: SpecName,
    *,
    class_case: str = "pascal",
    interface_case: str = "pascal",
    enum_case: str = "pascal",
    enum_value_case: str = "constant",
    field_case: str = "camel",
    method_case: str = "camel",
    function_case: str = "camel",
    constant_case: str = "screaming_snake",
    file_case: str = "path",
    module_case: str = "path",
    package_case: str = "snake",
) -> LanguageName:
    """Create TypeScript-safe language names."""

    class_name, class_escaped, class_reason = _escape(get_case_value(name, class_case))
    interface_name, interface_escaped, interface_reason = _escape(
        get_case_value(name, interface_case)
    )
    field_name, field_escaped, field_reason = _escape(get_case_value(name, field_case))
    method_name, method_escaped, method_reason = _escape(get_case_value(name, method_case))

    escaped = class_escaped or interface_escaped or field_escaped or method_escaped
    reason = class_reason or interface_reason or field_reason or method_reason

    return LanguageName(
        class_name=class_name,
        interface_name=interface_name,
        enum_name=get_case_value(name, enum_case),
        enum_value_name=get_case_value(name, enum_value_case),
        field_name=field_name,
        method_name=method_name,
        function_name=get_case_value(name, function_case),
        constant_name=get_case_value(name, constant_case),
        variable_name=field_name,
        file_name=get_case_value(name, file_case),
        module_name=get_case_value(name, module_case),
        package_name=get_case_value(name, package_case),
        is_reserved=escaped,
        escaped=escaped,
        escape_reason=reason,
    )
