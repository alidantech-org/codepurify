import type { VersionContract } from '../version/version-contract.types.js';
import type { CompilerContext } from './compiler-context.js';
import { resolveCompilerContext } from './compiler-context.js';
import { OpenApiVersion } from '../openapi/openapi-version.js';
import type { OpenApiDocument } from '../openapi/openapi.types.js';
import { validateContract } from '../validation/validate-contract.js';
import { compileComponents } from './compile-components.js';
import { compilePaths } from './paths/compile-paths.js';
import type { CompileOptions } from './compile-options.types.js';
import type { CompileResult } from './compile-result.types.js';
import { compileInferredComponents } from './paths/compile-inferred-components.js';
import { resolvePendingRefs } from './refs/resolve-pending-refs.js';
import { buildSchemaResolver } from './schemas/build-schema-resolver.js';

export function compileOpenApi(contract: VersionContract, options: CompileOptions = {}, context: CompilerContext = {}): CompileResult {
  const resolvedContext = resolveCompilerContext(context);
  const shouldValidate = options.validate ?? true;
  const validation = shouldValidate ? validateContract(contract) : { valid: true, issues: [] };

  const document = createOpenApiShell(contract, options, resolvedContext);

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

function createOpenApiShell(contract: VersionContract, options: CompileOptions, context: CompilerContext): OpenApiDocument {
  // First, build the schema resolver without compiling components yet
  // This is needed for compilePaths to resolve refs
  const resolver = buildSchemaResolver(
    contract.resources,
    contract.properties,
    contract.schemaComponents,
    contract.parameterComponents,
    contract.requestBodyComponents,
    contract.responseComponents,
    context,
  );

  // Compile paths first to collect DTO role usage
  const { paths, inferredComponents } = compilePaths(contract, resolver, context);

  // Now compile components with the populated dtoRoleUsage map, reusing the resolver
  const compiledComponents = compileComponents(contract, context, resolver);
  const compiledInferred = compileInferredComponents(inferredComponents, compiledComponents.resolver, context);

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
