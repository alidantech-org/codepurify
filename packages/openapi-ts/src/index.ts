export { defineVersionContract } from "./version/define-version-contract.js";
export { defineResource } from "./resource/define-resource.js";

export { schema } from "./schema/schema.js";

export { HttpMethod } from "./routes/http-method.js";

export { SdkExtensionKey } from "./sdk/sdk-extension.keys.js";
export {
  SdkKind,
  SdkPlacement,
  SdkScope,
  SdkSource,
} from "./sdk/sdk-extension.types.js";

export { validateContract } from "./validation/validate-contract.js";
export type {
  ValidationIssue,
  ValidationResult,
} from "./validation/validation-result.types.js";
export { OpenApiVersion } from "./openapi/openapi-version.js";
export type {
  OpenApiDocument,
  OpenApiInfo,
  OpenApiServer,
  OpenApiComponents,
  OpenApiOperation,
  OpenApiPaths,
} from "./openapi/openapi.types.js";
export type { CompileOptions } from "./compiler/compile-options.types.js";
export type {
  CompileFailureResult,
  CompileResult,
  CompileSuccessResult,
} from "./compiler/compile-result.types.js";
export { compileOpenApi } from "./compiler/compile-openapi.js";
export { toSchemaName } from "./naming/schema-name.js";
export {
  componentRefToSchemaName,
  modelRefToSchemaName,
} from "./naming/ref-schema-name.js";
export { definePackageConfig } from "./config/define-package-config.js";
export { PackageOutputFormat } from "./config/package-config.types.js";

export type {
  PackageConfig,
  PackageOutputConfig,
  PackageServerConfig,
} from "./config/package-config.types.js";
export { ContentType, DefaultOutputConfig } from "./output/output.constants.js";

export type {
  OutputFileResult,
  ResolvedOutputConfig,
} from "./output/output.types.js";
export { OpenApiRefPattern } from "./openapi/ref-patterns.js";
export {
  createDebugFileName,
  createOpenApiFileName,
} from "./output/openapi-file-name.js";
export { resolveCompileOptions } from "./config/resolve-compile-options.js";
export { resolveOutputConfig } from "./output/resolve-output-config.js";

export { writeOpenApiFiles } from "./writer/write-openapi-files.js";
export type { WriteOpenApiFilesInput } from "./writer/write-openapi-files.js";
export {
  validateOpenApiDocument,
  type OpenApiValidationResult,
} from "./validator/validate-openapi-document.js";
export {
  generateOpenApi,
  type GenerateOpenApiResult,
} from "./generator/generate-openapi.js";
export { resolvePackageConfig } from "./config/resolve-package-config.js";
export { OpenApiTs } from "./api/openapi-ts.js";

export type {
  GenerateInput,
  GenerateResult,
  InitConfigInput,
  InitConfigResult,
  OpenApiTsApi,
} from "./api/openapi-ts.types.js";
