export { defineVersionContract } from "./version/define-version-contract";
export { defineResource } from "./resource/define-resource";

export { schema } from "./schema/schema";

export { HttpMethod } from "./routes/http-method";

export { SdkExtensionKey } from "./sdk/sdk-extension.keys";
export {
  SdkKind,
  SdkPlacement,
  SdkScope,
  SdkSource,
} from "./sdk/sdk-extension.types.js";

export { validateContract } from "./validation/validate-contract";
export type {
  ValidationIssue,
  ValidationResult,
} from "./validation/validation-result.types.js";
export { OpenApiVersion } from "./openapi/openapi-version";
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
export { compileOpenApi } from "./compiler/compile-openapi";
export { toSchemaName } from "./naming/schema-name";
export {
  componentRefToSchemaName,
  modelRefToSchemaName,
} from "./naming/ref-schema-name";
export { definePackageConfig } from "./config/define-package-config";
export { PackageOutputFormat } from "./config/package-config.types.js";

export type {
  PackageConfig,
  PackageOutputConfig,
  PackageServerConfig,
} from "./config/package-config.types.js";
export { ContentType, DefaultOutputConfig } from "./output/output.constants";

export type {
  OutputFileResult,
  ResolvedOutputConfig,
} from "./output/output.types.js";
export { OpenApiRefPattern } from "./openapi/ref-patterns";
export {
  createDebugFileName,
  createOpenApiFileName,
} from "./output/openapi-file-name";
export { resolveCompileOptions } from "./config/resolve-compile-options";
export { resolveOutputConfig } from "./output/resolve-output-config";

export { writeOpenApiFiles } from "./writer/write-openapi-files";
export type { WriteOpenApiFilesInput } from "./writer/write-openapi-files";
export {
  validateOpenApiDocument,
  type OpenApiValidationResult,
} from "./validator/validate-openapi-document";
export {
  generateOpenApi,
  type GenerateOpenApiResult,
} from "./generator/generate-openapi";
export { resolvePackageConfig } from "./config/resolve-package-config";
