import type { OpenApiPaths, OpenApiOperation } from '../../openapi/openapi.types.js';
import type { VersionContract } from '../../version/version-contract.types.js';
import type { CompilerContext } from '../compiler-context.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { expressPathToOpenApi } from './express-path-to-openapi.js';
import type { RouteDefinition, RouteParameterMap, RouteParameterRegistry } from '../../routes/route.types.js';
import type { InferredParameterComponent, InferredRouteComponents } from './inferred-route-components.types.js';
import { inferRouteComponents } from './infer-route-components.js';
import { compileRouteOperation } from './compile-route-operation.js';
import { extractPathParamNames } from '../../routes/route.types.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isComponentRef } from '../../validation/ref-guards.js';
import { createOperationParameterTargetMeta } from './parameter-target-metadata.js';

export function compilePaths(
  contract: VersionContract,
  resolver: RefResolver,
  context: CompilerContext,
): {
  paths: OpenApiPaths;
  inferredComponents: InferredRouteComponents;
} {
  const paths: OpenApiPaths = {};
  const allInferredComponents: InferredRouteComponents = {
    parameters: new Map(),
    requestBodies: new Map(),
    responses: new Map(),
  };

  // Create reusable response components for default responses
  if (contract.defaultResponses) {
    for (const [status, response] of Object.entries(contract.defaultResponses)) {
      const componentName = `Default${status}Response`;
      allInferredComponents.responses.set(componentName, {
        name: componentName,
        status: parseInt(status),
        description:
          typeof response === 'object' && response !== null && 'description' in response
            ? (response as { description: string }).description
            : `Default ${status}`,
        schema:
          typeof response === 'object' && response !== null && 'schema' in response
            ? (response as { schema: unknown }).schema
            : (response as any),
        contentType: 'application/json',
        noContent: false,
        operationId: '',
      });
    }
  }

  // First pass: collect all operations and inferred components
  const pathOperations = new Map<
    string,
    Array<{ method: string; operation: OpenApiOperation; inferred: InferredRouteComponents; resourceContext: any }>
  >();

  for (const resource of contract.resources) {
    for (const registry of resource.routes) {
      for (const route of Object.values(registry.routes)) {
        const fullPath = expressPathToOpenApi(`${resource.context.route}${route.path}`);
        const pathParams = resolvePathParameters(registry.parameters, route.path, route.operationId);

        // Infer components for this route
        const inferred = inferRouteComponents(
          route,
          pathParams,
          resource.context.key,
          contract.defaultResponses,
          contract.defaults,
          context,
          contract,
        );

        // Merge inferred components
        mergeInferredComponents(allInferredComponents, inferred);

        const operation = compileRouteOperationWithRefs(route, resolver, inferred, context, contract);

        if (!pathOperations.has(fullPath)) {
          pathOperations.set(fullPath, []);
        }
        pathOperations.get(fullPath)!.push({ method: route.method, operation, inferred, resourceContext: resource.context });
      }
    }
  }

  // Second pass: extract common path parameters and build final paths
  for (const [fullPath, operations] of pathOperations.entries()) {
    const commonPathParams = findCommonPathParameters(operations, allInferredComponents);

    const pathItem: Record<string, unknown> = {};

    // Add resource metadata to path item
    if (operations.length > 0) {
      const firstOperation = operations[0];
      if (firstOperation.resourceContext) {
        const xCodegen: Record<string, unknown> = {
          resource: {
            name: firstOperation.resourceContext.name || firstOperation.resourceContext.key || 'unknown',
            path: firstOperation.resourceContext.folders || [],
          },
        };

        pathItem['x-codegen'] = xCodegen;
      }
    }

    // Add common path parameters at path level
    if (commonPathParams.length > 0) {
      pathItem.parameters = commonPathParams;
    }

    // Add operations, removing duplicated path params
    for (const { method, operation, inferred, resourceContext } of operations) {
      const filteredOperation = { ...operation };

      // Replace default responses with $ref
      if (contract.defaultResponses) {
        for (const status of Object.keys(contract.defaultResponses)) {
          if (filteredOperation.responses && filteredOperation.responses[status]) {
            const componentName = `Default${status}Response`;
            filteredOperation.responses[status] = { $ref: `#/components/responses/${componentName}` };
          }
        }
      }

      // Remove common path params from operation-level parameters
      if (commonPathParams.length > 0 && filteredOperation.parameters) {
        filteredOperation.parameters = (filteredOperation.parameters as unknown[]).filter(
          (param) => !isSameParameterRef(param, commonPathParams),
        );
      }

      // Remove empty parameters array
      if (filteredOperation.parameters && Array.isArray(filteredOperation.parameters) && filteredOperation.parameters.length === 0) {
        delete filteredOperation.parameters;
      }

      pathItem[method] = filteredOperation;
    }

    paths[fullPath] = pathItem;
  }

  return { paths, inferredComponents: allInferredComponents };
}

function resolvePathParameters(
  parameters: RouteParameterRegistry | undefined,
  routePath: string,
  operationId?: string,
): RouteParameterMap | undefined {
  if (!parameters) return undefined;

  const paramNames = extractPathParamNames(routePath);
  if (paramNames.length === 0) return undefined;

  const result: RouteParameterMap = {};

  for (const paramName of paramNames) {
    const paramRef = parameters[paramName];
    if (!paramRef) {
      throw new Error(
        `Route "${operationId || 'unknown'}" path "${routePath}" declares path parameter "${paramName}" but no parameter ref was registered in defineRoutes({ parameters }).`,
      );
    }
    result[paramName] = paramRef;
  }

  return result;
}

function mergeInferredComponents(target: InferredRouteComponents, source: InferredRouteComponents): void {
  for (const [key, value] of source.parameters.entries()) {
    target.parameters.set(key, value);
  }
  for (const [key, value] of source.requestBodies.entries()) {
    target.requestBodies.set(key, value);
  }
  for (const [key, value] of source.responses.entries()) {
    target.responses.set(key, value);
  }
}

function getParameterRefs(parameters: Map<string, InferredParameterComponent>): unknown[] {
  const refs: unknown[] = [];
  for (const param of parameters.values()) {
    refs.push({ $ref: `#/components/parameters/${param.name}` });
  }
  return refs;
}

function compileRouteOperationWithRefs(
  route: RouteDefinition,
  resolver: RefResolver,
  inferred: InferredRouteComponents,
  context: CompilerContext,
  contract?: VersionContract,
): OpenApiOperation {
  const operation = compileRouteOperation(route, resolver, contract?.defaultResponses ?? {}, contract, context);

  // Replace inline requestBody with $ref if inferred component exists
  for (const [key, body] of inferred.requestBodies.entries()) {
    if (body.operationId === route.operationId && operation.requestBody) {
      operation.requestBody = { $ref: `#/components/requestBodies/${body.name}` };
      break;
    }
  }

  // Replace inline responses with $ref if inferred components exist
  for (const [key, response] of inferred.responses.entries()) {
    if (response.operationId === route.operationId && operation.responses) {
      const status = response.status.toString();
      if (operation.responses[status]) {
        operation.responses[status] = { $ref: `#/components/responses/${response.name}` };
      }
    }
  }

  // Add inferred parameters to the operation
  const parameterRefs = getParameterRefsForRoute(route, inferred);
  if (parameterRefs.length > 0) {
    operation.parameters = [...(operation.parameters || []), ...parameterRefs];
  }

  // Add parameters.target if route.query is a ComponentRef or RefUsage<ComponentRef>
  // This happens after inferred params are added so we have the full parameter list
  if (route.query) {
    let queryRef: ComponentRef | undefined;
    if (isComponentRef(route.query)) {
      queryRef = route.query;
    } else if (isRefUsage(route.query) && isComponentRef(route.query.ref)) {
      queryRef = route.query.ref;
    }

    if (queryRef) {
      const schemaName = resolver.schemas.get(queryRef.id);
      // Use schemaName from resolver, or fallback to queryRef.id
      const finalSchemaName = schemaName || queryRef.id;
      if (finalSchemaName) {
        const querySchemaRef = `#/components/schemas/${finalSchemaName}`;
        const operationParameterRefs = (operation.parameters || [])
          .map((p) => {
            if (typeof p === 'object' && p !== null && '$ref' in p) {
              return (p as { $ref: string }).$ref;
            }
            return undefined;
          })
          .filter(Boolean) as string[];

        const parameterTargetMeta = createOperationParameterTargetMeta({
          querySchemaRef,
          operationParameterRefs,
        });

        if (parameterTargetMeta) {
          // Directly set x-codegen with parameters.target
          (operation as unknown as Record<string, unknown>)['x-codegen'] = {
            parameters: parameterTargetMeta,
          };
        }
      }
    }
  }

  return operation;
}

function getParameterRefsForRoute(route: RouteDefinition, inferred: InferredRouteComponents): unknown[] {
  const refs: unknown[] = [];

  // Get parameters that belong to this route's operationId
  for (const param of inferred.parameters.values()) {
    if (param.operationId === route.operationId) {
      refs.push({ $ref: `#/components/parameters/${param.name}` });
    }
  }

  return refs;
}

function compileResponsesWithRefs(route: RouteDefinition, inferred: InferredRouteComponents): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  for (const response of inferred.responses.values()) {
    responses[response.status.toString()] = { $ref: `#/components/responses/${response.name}` };
  }

  if (Object.keys(responses).length === 0) {
    responses[204] = { description: 'No content' };
  }

  return responses;
}

function findCommonPathParameters(
  operations: Array<{ method: string; operation: OpenApiOperation; inferred: InferredRouteComponents }>,
  allInferredComponents: InferredRouteComponents,
): unknown[] {
  if (operations.length === 0) return [];

  // Collect all path parameters from all operations
  const allPathParams = new Map<string, unknown>();

  for (const { operation, inferred } of operations) {
    for (const [key, param] of inferred.parameters.entries()) {
      if (param.operationId === operation.operationId && param.in === 'path') {
        const paramRef = { $ref: `#/components/parameters/${param.name}` };
        const keyForParam = `${param.name}-${param.in}`;

        if (!allPathParams.has(keyForParam)) {
          allPathParams.set(keyForParam, paramRef);
        }
      }
    }
  }

  // A parameter is common if it appears in all operations
  const commonParams: unknown[] = [];
  const paramCounts = new Map<string, number>();

  for (const { operation, inferred } of operations) {
    for (const [key, param] of inferred.parameters.entries()) {
      if (param.operationId === operation.operationId && param.in === 'path') {
        const keyForParam = `${param.name}-${param.in}`;
        paramCounts.set(keyForParam, (paramCounts.get(keyForParam) || 0) + 1);
      }
    }
  }

  for (const [key, count] of paramCounts.entries()) {
    if (count === operations.length) {
      const paramRef = allPathParams.get(key);
      if (paramRef) {
        commonParams.push(paramRef);
      }
    }
  }

  return commonParams;
}

function isSameParameterRef(param: unknown, commonParams: unknown[]): boolean {
  if (!param || typeof param !== 'object') return false;
  const paramObj = param as { $ref?: string };
  if (!paramObj.$ref) return false;

  return commonParams.some(
    (common) => typeof common === 'object' && common !== null && (common as { $ref?: string }).$ref === paramObj.$ref,
  );
}
