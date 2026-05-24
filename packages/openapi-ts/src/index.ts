/* =========================================================
 * Core contract builders
 * ========================================================= */

export { defineVersionContract } from './version/define-version-contract.js';
export { defineResource } from './resource/define-resource.js';

export type { VersionContract as OpenApiVersionContract } from './version/version-contract.types.js';
export type { ResourceBuilder as OpenApiResourceContract } from './resource/define-resource.js';

/* =========================================================
 * Public API facade
 * ========================================================= */

export { OpenApiTs } from './api/openapi-ts.js';

export type { GenerateInput, GenerateResult, InitConfigInput, InitConfigResult, OpenApiTsApi } from './api/openapi-ts.types.js';

/* =========================================================
 * Schema DSL
 * ========================================================= */

export { schema } from './schema/schema.js';

export {
  SchemaAccess,
  isClientWritableAccess,
  isHiddenByDefault,
  isInternalAccess,
  isSensitiveAccess,
  isSystemManagedAccess,
} from './schema/schema-access.js';

export { QueryOperator } from './schema/query-behavior.js';

export type { PrimitiveQueryOptions } from './schema/query-behavior.js';

/* =========================================================
 * Routes
 * ========================================================= */

export { HttpMethod } from './routes/http-method.js';

/* =========================================================
 * Components
 * ========================================================= */

export { ComponentBucket } from './components/component-bucket.js';

export type { ComponentFieldMap } from './components/component.types.js';

export { defineSchemas } from './components/schemas/define-schemas.js';

export type { SchemaComponentDefinition, SchemaComponentRegistry } from './components/schemas/schema-component.types.js';

export { ParameterLocation } from './components/parameters/parameter-location.js';
export { defineParameters } from './components/parameters/define-parameters.js';

export type {
  ParameterComponentDefinition,
  ParameterComponentRegistry,
  ParameterSchemaRef,
} from './components/parameters/parameter-component.types.js';

export { defineRequestBodies } from './components/request-bodies/define-request-bodies.js';

export type {
  RequestBodyComponentDefinition,
  RequestBodyComponentRegistry,
  RequestBodySchemaRef,
} from './components/request-bodies/request-body-component.types.js';

export { defineResponses } from './components/responses/define-responses.js';

export type {
  ResponseComponentDefinition,
  ResponseComponentRegistry,
  ResponseSchemaRef,
} from './components/responses/response-component.types.js';

/* =========================================================
 * Properties and refs
 * ========================================================= */

export type { EntityPropertyRefs, PropertyRefGroup } from './properties/property.types.js';

export type { ComponentRef, ModelRef, ParameterRef, PropertyRef, RequestBodyRef, ResponseRef } from './refs/ref.types.js';

/* =========================================================
 * Codegen metadata
 * ========================================================= */

export { CODEGEN_EXTENSION_KEY, CodegenExtensionKey } from './sdk/codegen-extension.keys.js';

export { XCodegenAccess, XCodegenDtoRole, XCodegenEntityVariant, XCodegenKind } from './sdk/codegen-extension.types.js';

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
  // XCodegenMeta,
  XCodegenModelMeta,
  XCodegenPrimitiveMeta,
  XCodegenQueryMeta,
  XCodegenRefPointer,
  XCodegenResourceMeta,
} from './sdk/codegen-extension.types.js';

export {
  isDtoSchema,
  isEnumSchema,
  isModelSchema,
  isObjectSchema,
  isPrimitiveSchema,
  resolveCodegenKind,
  stripEnumInheritanceMetadata,
  stripNonObjectInheritanceMetadata,
} from './sdk/resolve-codegen-kind.js';

export { applyCodegenMetadata } from './sdk/apply-codegen-extensions.js';

export type { CodegenExtensionTarget } from './sdk/apply-codegen-extensions.js';

/* =========================================================
 * OpenAPI types and constants
 * ========================================================= */

export { OpenApiVersion } from './openapi/openapi-version.js';
export { ContentType as OpenApiContentType } from './openapi/content-type.js';
export { OpenApiRefPattern } from './openapi/ref-patterns.js';

export type { ContentTypeInput } from './openapi/content-type.js';

export type {
  OpenApiComponents,
  OpenApiDocument,
  OpenApiInfo,
  OpenApiOperation,
  OpenApiPaths,
  OpenApiServer,
} from './openapi/openapi.types.js';

/* =========================================================
 * Compiler
 * ========================================================= */

export { compileOpenApi } from './compiler/compile-openapi.js';

export type { CompileOptions } from './compiler/compile-options.types.js';

export type { CompileFailureResult, CompileResult, CompileSuccessResult } from './compiler/compile-result.types.js';

/* =========================================================
 * Validation
 * ========================================================= */

export { validateContract } from './validation/validate-contract.js';

export type { ValidationIssue, ValidationResult } from './validation/validation-result.types.js';

export { validateOpenApiDocument, type OpenApiValidationResult } from './validator/validate-openapi-document.js';

/* =========================================================
 * Config
 * ========================================================= */

export { definePackageConfig } from './config/define-package-config.js';
export { PackageOutputFormat } from './config/package-config.types.js';
export { resolveCompileOptions } from './config/resolve-compile-options.js';
export { resolvePackageConfig } from './config/resolve-package-config.js';

export type { PackageConfig, PackageOutputConfig, PackageServerConfig } from './config/package-config.types.js';

/* =========================================================
 * Output and writer
 * ========================================================= */

export { ContentType, DefaultOutputConfig } from './output/output.constants.js';
export { createDebugFileName, createOpenApiFileName } from './output/openapi-file-name.js';
export { resolveOutputConfig } from './output/resolve-output-config.js';

export type { OutputFileResult, ResolvedOutputConfig } from './output/output.types.js';

export { writeOpenApiFiles } from './writer/write-openapi-files.js';

export type { WriteOpenApiFilesInput } from './writer/write-openapi-files.js';

/* =========================================================
 * Generator
 * ========================================================= */

export { generateOpenApi, type GenerateOpenApiResult } from './generator/generate-openapi.js';

/* =========================================================
 * Naming helpers
 * ========================================================= */

export { toSchemaName } from './naming/schema-name.js';

export { componentRefToSchemaName, modelRefToSchemaName } from './naming/ref-schema-name.js';

/* =========================================================
 * Logger
 * ========================================================= */

export { CompilerLogger, LogLevel } from './logger/index.js';
