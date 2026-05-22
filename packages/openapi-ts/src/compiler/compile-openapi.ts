import type { VersionContract } from '../version/version-contract.types.js';
import type { CompilerContext } from './compiler-context.types.js';
import { OpenApiVersion } from '../openapi/openapi-version.js';
import type { OpenApiDocument } from '../openapi/openapi.types.js';
import { validateContract } from '../validation/validate-contract.js';
import { compileComponents } from './compile-components.js';
import { compilePaths } from './paths/compile-paths.js';
import type { CompileOptions } from './compile-options.types.js';
import type { CompileResult } from './compile-result.types.js';
import { compileInferredComponents } from './paths/compile-inferred-components.js';
import type { InferredRouteComponents } from './paths/inferred-route-components.types.js';
import { resolvePendingRefs } from './refs/resolve-pending-refs.js';

export function compileOpenApi(contract: VersionContract, options: CompileOptions = {}, context: CompilerContext): CompileResult {
  const logger = context.logger.child({
    scope: 'compiler',
    version: contract.info.version,
  });

  logger.step(`Compiling ${contract.info.title} ${contract.info.version}`);

  const shouldValidate = options.validate ?? true;
  const validation = shouldValidate ? validateContract(contract) : { valid: true, issues: [] };

  const document = createOpenApiShell(contract, options, context);

  if (!validation.valid) {
    return {
      success: false,
      document,
      issues: validation.issues,
    };
  }

  logger.verbose('Compiled OpenAPI summary', {
    pathCount: Object.keys(document.paths).length,
    schemaCount: Object.keys(document.components?.schemas ?? {}).length,
    parameterCount: Object.keys(document.components?.parameters ?? {}).length,
    requestBodyCount: Object.keys(document.components?.requestBodies ?? {}).length,
    responseCount: Object.keys(document.components?.responses ?? {}).length,
  });

  logger.debug('OpenAPI component keys', {
    schemas: Object.keys(document.components?.schemas ?? {}),
    parameters: Object.keys(document.components?.parameters ?? {}),
    requestBodies: Object.keys(document.components?.requestBodies ?? {}),
    responses: Object.keys(document.components?.responses ?? {}),
  });

  return {
    success: true,
    document,
    issues: [],
  };
}

function createOpenApiShell(contract: VersionContract, options: CompileOptions, context: CompilerContext): OpenApiDocument {
  const logger = context.logger.child({
    scope: 'compiler',
    version: contract.info.version,
  });

  logger.verbose('Contract summary', {
    resourceCount: contract.resources.length,
    schemaComponentCount: contract.schemaComponents.length,
    propertyRegistryCount: contract.properties.length,
    defaultResponseStatuses: Object.keys(contract.defaultResponses),
  });

  logger.step('Compiling components');
  const compiledComponents = compileComponents(contract, context);

  logger.step('Compiling paths');
  const { paths, inferredComponents } = compilePaths(contract, compiledComponents.resolver, context);

  logger.step('Compiling inferred route components');
  const compiledInferred = compileInferredComponents(inferredComponents, compiledComponents.resolver, context);

  logger.step('Resolving pending refs');
  const document = {
    openapi: options.openapi ?? OpenApiVersion.v3_1_0,
    info: {
      title: contract.info.title,
      version: contract.info.version,
      description: contract.info.description,
      license: contract.info.license,
    },
    servers: options.servers ? [...options.servers] : undefined,
    security: [{ bearerAuth: [] }],
    paths,
    components: {
      ...compiledComponents.components,
      parameters: {
        ...compiledInferred.parameters,
        ...compiledComponents.components.parameters,
      },
      requestBodies: {
        ...compiledInferred.requestBodies,
        ...compiledComponents.components.requestBodies,
      },
      responses: {
        ...compiledInferred.responses,
        ...compiledComponents.components.responses,
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };

  return resolvePendingRefs(document, compiledComponents.resolver, context) as OpenApiDocument;
}
