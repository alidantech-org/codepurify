import type { CompilerContext } from './compiler-context';
import { resolveCompilerContext } from './compiler-context';
import { validateContract } from '../validation/validate-contract';
import { compileComponents } from './compile-components';
import { compilePaths } from './paths/compile-paths';
import type { CompileOptions } from './compile-options.types';
import type { CompileResult } from './compile-result.types';
import { compileInferredComponents } from './paths/compile-inferred-components';
import { resolvePendingRefs } from './refs/resolve-pending-refs';
import { collectDtoRoleUsageFromContract } from './dto-role-usage';
import { VersionContract } from '@/contract/version/version-contract.types';
import { OpenApiVersion } from '../targets/openapi/options/openapi-version';
import { OpenApiDocument } from '../targets/openapi/options/openapi.types';

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
  // Prepass: collect DTO role usage from routes
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
  };

  return resolvePendingRefs(document, compiledComponents.resolver, context) as OpenApiDocument;
}
