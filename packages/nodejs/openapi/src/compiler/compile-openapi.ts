import type { VersionContract } from '../version/version-contract.types.js';
import type { CompilerContext, ResolvedCompilerContext } from './compiler-context.js';
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
import { collectDtoRoleUsageFromContract } from './dto-role-usage.js';
import { collectAccessMetadataFromContract } from './access-metadata.js';
import { compileEntityMetadata } from './entity-metadata.js';
import type { RefResolver } from './refs/ref-resolver.types.js';
import { compileAccessRegistryMetadata } from './access-registry-metadata.js';

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

function createOpenApiShell(contract: VersionContract, options: CompileOptions, context: ResolvedCompilerContext): OpenApiDocument {
  // Prepass: collect DTO role usage from routes
  collectAccessMetadataFromContract(contract, context);
  collectDtoRoleUsageFromContract(contract, context);

  // Compile components first
  const compiledComponents = compileComponents(contract, context);

  // Compile paths using the resolver from components
  const { paths, inferredComponents } = compilePaths(contract, compiledComponents.resolver, context);
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
    'x-codegen': createDocumentCodegenMetadata(contract, compiledComponents.resolver),
  };

  return resolvePendingRefs(document, compiledComponents.resolver, context) as OpenApiDocument;
}

function createDocumentCodegenMetadata(contract: VersionContract, resolver: RefResolver): Record<string, unknown> | undefined {
  const hooks = Object.fromEntries(
    contract.resources
      .filter((resource) => resource.hookComponents.length > 0)
      .map((resource) => [
        resource.context.alias,
        Object.fromEntries(
          resource.hookComponents.flatMap((registry) =>
            registry.definitions.map((definition) => [
              definition.key,
              cleanObject({
                phase: definition.phase,
                owner: definition.owner,
                transport: definition.transport,
                description: definition.description,
              }),
            ]),
          ),
        ),
      ]),
  );

  const entities = compileEntityMetadata(contract, resolver);
  const access = compileAccessRegistryMetadata(contract, resolver).access;
  const metadata = cleanObject({
    access,
    ...entities,
    hooks: Object.keys(hooks).length > 0 ? hooks : undefined,
  });

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function cleanObject(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}
