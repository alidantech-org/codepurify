// src/index.ts

export { codepot, createCodepotRuntime } from './codepot';

export type { CodepotRuntime, CodepotRuntimeState } from './codepot';

export {
  defineCodepotConfig,
  defineVersionContract,
  defineProperties,
  defineDtoSchemas,
  defineResource,
  defineRoutes,
  defineTransport,
  defineSecurity,
  property,
  field,
  query,
  access,
  persistence,
  security,
  securityScheme,
  securityAuth,
  securityContext,
  securityGuard,
  securityRoleSource,
  securityRoleSet,
  securityRoute,
  transport,
  contentType,
  request,
  response,
  createAuthoringRef,
  createExtendableAuthoringRef,
  createUsage,
  createExtendableUsage,
  refPath,
  CodepotOutputFormat,
  AuthoringRefKind,
} from './contract';

export {
  compilePackage,
  compileVersionContract,
  writeCodepotJson,
  writeCodepotYaml,
  writePackage,
  writeFiles,
  writeCodepotPackage,
} from './pipeline';

export type {
  CompiledPackage,
  PackageWriteFile,
  PackageWriteResult,
  WriteFilesOptions,
  WrittenFileResult,
  WriteFilesResult,
  WriteCodepotPackageOptions,
} from './pipeline';
