import type { VersionContract } from '../version/version-contract.types.js';
import { OpenApiVersion } from '../openapi/openapi-version.js';
import type { OpenApiDocument } from '../openapi/openapi.types.js';
import { validateContract } from '../validation/validate-contract.js';
import { compileComponents } from './compile-components.js';
import { compilePaths } from './paths/compile-paths.js';
import type { CompileOptions } from './compile-options.types.js';
import type { CompileResult } from './compile-result.types.js';

export function compileOpenApi(contract: VersionContract, options: CompileOptions = {}): CompileResult {
  const shouldValidate = options.validate ?? true;
  const validation = shouldValidate ? validateContract(contract) : { valid: true, issues: [] };

  const document = createOpenApiShell(contract, options);

  if (!validation.valid) {
    return {
      success: false,
      document,
      issues: validation.issues,
    };
  }

  return {
    success: true,
    document,
    issues: [],
  };
}

function createOpenApiShell(contract: VersionContract, options: CompileOptions): OpenApiDocument {
  const compiledComponents = compileComponents(contract);

  return {
    openapi: options.openapi ?? OpenApiVersion.v3_1_0,
    info: {
      title: contract.info.title,
      version: contract.info.version,
      description: contract.info.description,
      license: contract.info.license,
    },
    servers: options.servers ? [...options.servers] : undefined,
    security: [{ bearerAuth: [] }],
    paths: compilePaths(contract, compiledComponents.resolver),
    components: {
      ...compiledComponents.components,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };
}
