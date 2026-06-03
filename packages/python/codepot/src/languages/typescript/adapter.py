"""TypeScript language adapter."""

from __future__ import annotations

from contracts.language.context import (
    LanguageField,
    LanguageItem,
    LanguageOperation,
    LanguageRoute,
)
from contracts.language.interface import (
    LanguageExportRequest,
    LanguageImportRequest,
    LanguageRuntimeRequest,
    LanguageTypeRequest,
)
from contracts.language.runtime import (
    LanguageImportRules,
    LanguageImportStrategy,
    LanguageNamingRules,
    LanguageRuntime,
)
from contracts.spec.records import SpecRecord
from languages.typescript.constants import (
    DEFAULT_CLASS_CASE,
    DEFAULT_CONSTANT_CASE,
    DEFAULT_ENUM_CASE,
    DEFAULT_ENUM_VALUE_CASE,
    DEFAULT_FIELD_CASE,
    DEFAULT_FILE_CASE,
    DEFAULT_FUNCTION_CASE,
    DEFAULT_IMPORT_STRATEGY,
    DEFAULT_INCLUDE_IMPORT_EXTENSION,
    DEFAULT_INTERFACE_CASE,
    DEFAULT_METHOD_CASE,
    DEFAULT_MODULE_CASE,
    DEFAULT_PACKAGE_CASE,
    DEFAULT_TYPE_ONLY_IMPORTS,
    TYPESCRIPT_LANGUAGE_KEY,
)
from languages.typescript.exports import create_typescript_exports
from languages.typescript.imports import create_typescript_imports
from languages.typescript.names import make_typescript_name
from languages.typescript.types import make_typescript_type
from languages.typescript.utils import safe_getattr


class TypeScriptLanguageAdapter:
    """TypeScript implementation of the Codepotx language adapter contract."""

    key = TYPESCRIPT_LANGUAGE_KEY

    def create_runtime(self, request: LanguageRuntimeRequest) -> LanguageRuntime:
        """Create TypeScript runtime context."""

        naming = request.naming
        imports = request.imports

        return LanguageRuntime(
            name=request.language,
            extension=request.extension,
            package_name=request.package_name,
            package_manager=request.package_manager,
            source_root=request.source_root,
            naming=LanguageNamingRules(
                class_case=str(safe_getattr(naming, "class_name", DEFAULT_CLASS_CASE)),
                interface_case=str(safe_getattr(naming, "interface", DEFAULT_INTERFACE_CASE)),
                enum_case=str(safe_getattr(naming, "enum", DEFAULT_ENUM_CASE)),
                enum_value_case=str(
                    safe_getattr(naming, "enum_value", DEFAULT_ENUM_VALUE_CASE)
                ),
                field_case=str(safe_getattr(naming, "field", DEFAULT_FIELD_CASE)),
                method_case=str(safe_getattr(naming, "method", DEFAULT_METHOD_CASE)),
                function_case=str(safe_getattr(naming, "function", DEFAULT_FUNCTION_CASE)),
                constant_case=str(safe_getattr(naming, "constant", DEFAULT_CONSTANT_CASE)),
                file_case=str(safe_getattr(naming, "file", DEFAULT_FILE_CASE)),
                module_case=str(safe_getattr(naming, "module", DEFAULT_MODULE_CASE)),
                package_case=str(safe_getattr(naming, "package", DEFAULT_PACKAGE_CASE)),
            ),
            imports=LanguageImportRules(
                strategy=LanguageImportStrategy(
                    safe_getattr(imports, "strategy", DEFAULT_IMPORT_STRATEGY)
                ),
                root=safe_getattr(imports, "root", None),
                alias=safe_getattr(imports, "alias", None),
                package=safe_getattr(imports, "package", None),
                include_extension=bool(
                    safe_getattr(imports, "extension", DEFAULT_INCLUDE_IMPORT_EXTENSION)
                ),
                type_only=bool(safe_getattr(imports, "type_only", DEFAULT_TYPE_ONLY_IMPORTS)),
            ),
        )

    def enrich_item(
        self, record: SpecRecord[object], runtime: LanguageRuntime
    ) -> LanguageItem:
        """Create generic TypeScript item `.lang` context."""

        lang_name = make_typescript_name(
            record.name,
            class_case=runtime.naming.class_case,
            interface_case=runtime.naming.interface_case,
            enum_case=runtime.naming.enum_case,
            enum_value_case=runtime.naming.enum_value_case,
            field_case=runtime.naming.field_case,
            method_case=runtime.naming.method_case,
            function_case=runtime.naming.function_case,
            constant_case=runtime.naming.constant_case,
            file_case=runtime.naming.file_case,
            module_case=runtime.naming.module_case,
            package_case=runtime.naming.package_case,
        )

        return LanguageItem(name=lang_name)

    def enrich_field(self, field: object, runtime: LanguageRuntime) -> LanguageField:
        """Create TypeScript field `.lang` context."""

        name = getattr(field, "name", None)
        if name is None and getattr(field, "record", None) is not None:
            name = field.record.name

        lang_name = make_typescript_name(name, field_case=runtime.naming.field_case)
        is_nullable = bool(getattr(field, "is_nullable", False))
        is_array = bool(getattr(field, "is_array", False))
        is_required = bool(getattr(field, "is_required", False))

        lang_type = self.create_type(
            LanguageTypeRequest(
                source=getattr(field, "source", field),
                is_required=is_required,
                is_nullable=is_nullable,
                is_array=is_array,
            ),
            runtime,
        )

        return LanguageField(
            name=lang_name,
            type=lang_type,
            annotation=lang_type.annotation,
            is_optional=not is_required,
            is_nullable=is_nullable,
            is_array=is_array,
        )

    def enrich_operation(
        self, operation: object, runtime: LanguageRuntime
    ) -> LanguageOperation:
        """Create TypeScript operation `.lang` context."""

        record = (
            getattr(operation, "record", None)
            or getattr(operation, "item", None).record
        )
        item = self.enrich_item(record, runtime)
        return LanguageOperation(name=item.name)

    def enrich_route(self, route: object, runtime: LanguageRuntime) -> LanguageRoute:
        """Create TypeScript route `.lang` context."""

        record = getattr(route, "record", None) or getattr(route, "item", None).record
        item = self.enrich_item(record, runtime)
        return LanguageRoute(name=item.name, method_name=item.name.method_name)

    def create_type(self, request: LanguageTypeRequest, runtime: LanguageRuntime):
        """Create a TypeScript type annotation."""

        return make_typescript_type(
            request.source,
            is_array=request.is_array,
            is_nullable=request.is_nullable,
            is_dynamic=request.is_dynamic,
            is_void=request.is_void,
        )

    def create_imports(self, request: LanguageImportRequest):
        """Create TypeScript file-level imports."""

        return create_typescript_imports(request)

    def create_exports(self, request: LanguageExportRequest):
        """Create TypeScript file-level exports."""

        return create_typescript_exports(request)


typescript_language_adapter = TypeScriptLanguageAdapter()
