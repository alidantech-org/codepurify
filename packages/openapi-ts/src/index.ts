export { defineVersionContract } from './version/define-version-contract.js';
export { defineResource } from './resource/define-resource.js';
export type { VersionContract as OpenApiVersionContract } from './version/version-contract.types.js';
export type { ResourceBuilder as OpenApiResourceContract } from './resource/define-resource.js';

export * from './logger/index.js';

export type { ComponentFieldMap } from './components/component.types.js';
export type { PropertyRefGroup, EntityPropertyRefs } from './properties/property.types.js';
export type { ComponentRef, ParameterRef, RequestBodyRef, ResponseRef, PropertyRef, ModelRef } from './refs/ref.types.js';

export { schema } from './schema/schema.js';
export { SchemaAccess, isHiddenByDefault } from './schema/schema-access.js';
export { QueryBehavior } from './schema/query-behavior.js';
export type { PrimitiveQueryOptions } from './schema/query-behavior.js';

export { HttpMethod } from './routes/http-method.js';

export { SdkExtensionKey } from './sdk/sdk-extension.keys.js';
export { SdkKind, SdkPlacement, SdkScope, SdkSource } from './sdk/sdk-extension.types.js';

export { validateContract } from './validation/validate-contract.js';
export type { ValidationIssue, ValidationResult } from './validation/validation-result.types.js';
export { OpenApiVersion } from './openapi/openapi-version.js';
export type {
  OpenApiDocument,
  OpenApiInfo,
  OpenApiServer,
  OpenApiComponents,
  OpenApiOperation,
  OpenApiPaths,
} from './openapi/openapi.types.js';
export type { CompileOptions } from './compiler/compile-options.types.js';
export type { CompileFailureResult, CompileResult, CompileSuccessResult } from './compiler/compile-result.types.js';
export { compileOpenApi } from './compiler/compile-openapi.js';
export { toSchemaName } from './naming/schema-name.js';
export { componentRefToSchemaName, modelRefToSchemaName } from './naming/ref-schema-name.js';
export { definePackageConfig } from './config/define-package-config.js';
export { PackageOutputFormat } from './config/package-config.types.js';

export type { PackageConfig, PackageOutputConfig, PackageServerConfig } from './config/package-config.types.js';
export { ContentType, DefaultOutputConfig } from './output/output.constants.js';
export { ContentType as OpenApiContentType } from './openapi/content-type.js';
export type { ContentTypeInput } from './openapi/content-type.js';

export type { OutputFileResult, ResolvedOutputConfig } from './output/output.types.js';
export { OpenApiRefPattern } from './openapi/ref-patterns.js';
export { createDebugFileName, createOpenApiFileName } from './output/openapi-file-name.js';
export { resolveCompileOptions } from './config/resolve-compile-options.js';
export { resolveOutputConfig } from './output/resolve-output-config.js';

export { writeOpenApiFiles } from './writer/write-openapi-files.js';
export type { WriteOpenApiFilesInput } from './writer/write-openapi-files.js';
export { validateOpenApiDocument, type OpenApiValidationResult } from './validator/validate-openapi-document.js';
export { generateOpenApi, type GenerateOpenApiResult } from './generator/generate-openapi.js';
export { resolvePackageConfig } from './config/resolve-package-config.js';
export { OpenApiTs } from './api/openapi-ts.js';

export type { GenerateInput, GenerateResult, InitConfigInput, InitConfigResult, OpenApiTsApi } from './api/openapi-ts.types.js';
export { ComponentBucket } from './components/component-bucket.js';
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
