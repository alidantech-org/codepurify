import { CodePot } from './app/runtime/codepot';
import { GenerateInput, GenerateResult, InitConfigInput, InitConfigResult, CodePotApi } from './app/runtime/codepot.types';
import { createDebugFileName, createOpenApiFileName } from './app/runtime/output/openapi-file-name';
import { ContentType, DefaultOutputConfig } from './app/runtime/output/output.constants';
import { OutputFileResult, ResolvedOutputConfig } from './app/runtime/output/output.types';
import { resolveOutputConfig } from './app/runtime/output/resolve-output-config';
import { definePackageConfig } from './contract/config/define-package-config';
import { PackageOutputFormat, PackageConfig, PackageOutputConfig, PackageServerConfig } from './contract/config/package-config.types';
import { resolveCompileOptions } from './contract/config/resolve-compile-options';
import { resolvePackageConfig } from './contract/config/resolve-package-config';
import { EntityPropertyRefs, EntityRegistryResult, PropertyRefGroup, PropertyRegistry } from './contract/properties/property.types';
import { RefUsage } from './contract/refs/ref-usage.types';
import { ArrayRef, ExtendedRef } from './contract/refs/ref-wrapper.types';
import { ComponentRef, ModelRef, ParameterRef, PropertyRef, RequestBodyRef, ResponseRef } from './contract/refs/ref.types';
import { defineResource, ResourceBuilder } from './contract/resource/define-resource';
import { HttpMethod } from './contract/routes/http-method';
import { defineParameters } from './contract/schema/parameters/define-parameters';
import {
  ParameterComponentDefinition,
  ParameterComponentRegistry,
  ParameterSchemaRef,
} from './contract/schema/parameters/parameter-component.types';
import { ParameterLocation } from './contract/schema/parameters/parameter-location';
import { QueryOperator, PrimitiveQueryOptions } from './contract/schema/query-behavior';
import { defineRequestBodies } from './contract/schema/request-bodies/define-request-bodies';
import {
  RequestBodyComponentDefinition,
  RequestBodyComponentRegistry,
  RequestBodySchemaRef,
} from './contract/schema/request-bodies/request-body-component.types';
import { defineResponses } from './contract/schema/responses/define-responses';
import {
  ResponseComponentDefinition,
  ResponseComponentRegistry,
  ResponseSchemaRef,
} from './contract/schema/responses/response-component.types';
import { schema } from './contract/schema/schema';
import {
  SchemaAccess,
  isClientWritableAccess,
  isHiddenByDefault,
  isInternalAccess,
  isSensitiveAccess,
  isSystemManagedAccess,
} from './contract/schema/schema-access';
import { CompositeSchemaField, PrimitiveSchemaField, RefSchemaField } from './contract/schema/schema.types';
import { defineSchemas } from './contract/schema/schemas/define-schemas';
import { SchemaComponentDefinition, SchemaComponentRegistry } from './contract/schema/schemas/schema-component.types';
import { defineVersionContract, VersionBuilder } from './contract/version/define-version-contract';
import { VersionContract } from './contract/version/version-contract.types';
import { compileOpenApi } from './pipeline/compiler/compile-openapi';
import { CompileOptions } from './pipeline/compiler/compile-options.types';
import { CompileFailureResult, CompileResult, CompileSuccessResult } from './pipeline/compiler/compile-result.types';
import { applyCodegenMetadata, CodegenExtensionTarget } from './pipeline/targets/codegen/apply-codegen-extensions';
import { CODEGEN_EXTENSION_KEY, CodegenExtensionKey } from './pipeline/targets/codegen/codegen-extension.keys';
import {
  XCodegenAccess,
  XCodegenDtoRole,
  XCodegenEntityVariant,
  XCodegenKind,
  CodegenKind,
  CodegenMetadata,
  XCodegenBaseMeta,
  XCodegenDtoMeta,
  XCodegenEntityMeta,
  XCodegenEnumMeta,
  XCodegenModelMeta,
  XCodegenPrimitiveMeta,
  XCodegenQueryMeta,
  XCodegenRefPointer,
  XCodegenResourceMeta,
} from './pipeline/targets/codegen/codegen-extension.types';
import {
  isDtoSchema,
  isEnumSchema,
  isModelSchema,
  isObjectSchema,
  isPrimitiveSchema,
  resolveCodegenKind,
  stripEnumInheritanceMetadata,
  stripNonObjectInheritanceMetadata,
} from './pipeline/targets/codegen/resolve-codegen-kind';
import { ComponentBucket } from './pipeline/targets/openapi/components/component-bucket';
import { ComponentFieldMap } from './pipeline/targets/openapi/components/component.types';
import { generateOpenApi, GenerateOpenApiResult } from './pipeline/targets/openapi/generator/generate-openapi';
import { ContentTypeInput } from './pipeline/targets/openapi/options/content-type';
import { OpenApiVersion } from './pipeline/targets/openapi/options/openapi-version';
import {
  OpenApiComponents,
  OpenApiDocument,
  OpenApiInfo,
  OpenApiOperation,
  OpenApiPaths,
  OpenApiServer,
} from './pipeline/targets/openapi/options/openapi.types';
import { OpenApiRefPattern } from './pipeline/targets/openapi/options/ref-patterns';
import { validateOpenApiDocument, OpenApiValidationResult } from './pipeline/targets/openapi/validator/validate-openapi-document';
import { validateContract } from './pipeline/validation/validate-contract';
import { ValidationIssue, ValidationResult } from './pipeline/validation/validation-result.types';
import { CompilerLogger, LogLevel } from './utils/logger';
import { componentRefToSchemaName, modelRefToSchemaName } from './utils/naming/ref-schema-name';
import { toSchemaName } from './utils/naming/schema-name';
import { writeOpenApiFiles, WriteOpenApiFilesInput } from './utils/writer/write-openapi-files';

/* =========================================================
 * Core contract builders
 * ========================================================= */
export { defineVersionContract };
export { defineResource };

export type { VersionContract as OpenApiVersionContract };
export type { ResourceBuilder as OpenApiResourceContract };

/* =========================================================
 * Public API facade
 * ========================================================= */

export { CodePot };

export type { GenerateInput, GenerateResult, InitConfigInput, InitConfigResult, CodePotApi };

/* =========================================================
 * Schema DSL
 * ========================================================= */

export { schema };

export { SchemaAccess, isClientWritableAccess, isHiddenByDefault, isInternalAccess, isSensitiveAccess, isSystemManagedAccess };

export { QueryOperator };

export type { PrimitiveQueryOptions };

/* =========================================================
 * Routes
 * ========================================================= */

export { HttpMethod };

/* =========================================================
 * Components
 * ========================================================= */

export { ComponentBucket };

export type { ComponentFieldMap };

export { defineSchemas };

export type { SchemaComponentDefinition, SchemaComponentRegistry };

export { ParameterLocation };
export { defineParameters };

export type { ParameterComponentDefinition, ParameterComponentRegistry, ParameterSchemaRef };

export { defineRequestBodies };

export type { RequestBodyComponentDefinition, RequestBodyComponentRegistry, RequestBodySchemaRef };

export { defineResponses };

export type { ResponseComponentDefinition, ResponseComponentRegistry, ResponseSchemaRef };

/* =========================================================
 * Properties and refs
 * ========================================================= */

export type { EntityPropertyRefs, PropertyRefGroup };

export type { ComponentRef, ModelRef, ParameterRef, PropertyRef, RequestBodyRef, ResponseRef };

export type {
  EntityRegistryResult,
  ExtendedRef,
  PropertyRegistry,
  RefSchemaField,
  RefUsage,
  ArrayRef,
  VersionBuilder,
  PrimitiveSchemaField,
  CompositeSchemaField,
};

/* =========================================================
 * Codegen metadata
 * ========================================================= */

export { CODEGEN_EXTENSION_KEY, CodegenExtensionKey };

export { XCodegenAccess, XCodegenDtoRole, XCodegenEntityVariant, XCodegenKind };

export type {
  CodegenKind,
  CodegenMetadata,
  XCodegenAccess as XCodegenAccessType,
  XCodegenBaseMeta,
  XCodegenDtoMeta,
  XCodegenDtoRole as XCodegenDtoRoleType,
  XCodegenEntityMeta,
  XCodegenEntityVariant as XCodegenEntityVariantType,
  XCodegenEnumMeta,
  XCodegenModelMeta,
  XCodegenPrimitiveMeta,
  XCodegenQueryMeta,
  XCodegenRefPointer,
  XCodegenResourceMeta,
};

export {
  isDtoSchema,
  isEnumSchema,
  isModelSchema,
  isObjectSchema,
  isPrimitiveSchema,
  resolveCodegenKind,
  stripEnumInheritanceMetadata,
  stripNonObjectInheritanceMetadata,
};

export { applyCodegenMetadata };

export type { CodegenExtensionTarget };

/* =========================================================
 * OpenAPI types and constants
 * ========================================================= */

export { OpenApiVersion };
export { ContentType as OpenApiContentType };
export { OpenApiRefPattern };

export type { ContentTypeInput };

export type { OpenApiComponents, OpenApiDocument, OpenApiInfo, OpenApiOperation, OpenApiPaths, OpenApiServer };

/* =========================================================
 * Compiler
 * ========================================================= */

export { compileOpenApi };

export type { CompileOptions };

export type { CompileFailureResult, CompileResult, CompileSuccessResult };

/* =========================================================
 * Validation
 * ========================================================= */

export { validateContract };

export type { ValidationIssue, ValidationResult };

export { validateOpenApiDocument, type OpenApiValidationResult };

/* =========================================================
 * Config
 * ========================================================= */

export { definePackageConfig };
export { PackageOutputFormat };
export { resolveCompileOptions };
export { resolvePackageConfig };

export type { PackageConfig, PackageOutputConfig, PackageServerConfig };

/* =========================================================
 * Output and writer
 * ========================================================= */

export { ContentType, DefaultOutputConfig };
export { createDebugFileName, createOpenApiFileName };
export { resolveOutputConfig };

export type { OutputFileResult, ResolvedOutputConfig };

export { writeOpenApiFiles };

export type { WriteOpenApiFilesInput };

/* =========================================================
 * Generator
 * ========================================================= */

export { generateOpenApi, type GenerateOpenApiResult };

/* =========================================================
 * Naming helpers
 * ========================================================= */

export { toSchemaName };

export { componentRefToSchemaName, modelRefToSchemaName };

/* =========================================================
 * Logger
 * ========================================================= */

export { CompilerLogger, LogLevel };
