import type { OpenApiPaths, OpenApiOperation } from '../../openapi/openapi.types.js';
import type { VersionContract } from '../../version/version-contract.types.js';
import type { CompilerContext } from '../compiler-context.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { expressPathToOpenApi } from './express-path-to-openapi.js';
import type { RouteDefinition, RouteParameterMap, RoutePathParameterMap } from '../../routes/route.types.js';
import type { InferredParameterComponent, InferredRouteComponents } from './inferred-route-components.types.js';
import { inferRouteComponents } from './infer-route-components.js';

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

  for (const resource of contract.resources) {
    for (const registry of resource.routes) {
      for (const route of Object.values(registry.routes)) {
        const fullPath = expressPathToOpenApi(`${resource.context.basePath}${route.path}`);
        const pathParams = findPathParameters(registry.parameters, route.path);

        // Infer components for this route
        const inferred = inferRouteComponents(
          route,
          pathParams,
          resource.context.key,
          contract.defaultResponses,
          contract.defaults,
          context,
        );

        // Merge inferred components
        mergeInferredComponents(allInferredComponents, inferred);

        paths[fullPath] ??= {};

        // Use component refs instead of inline parameters
        const parameterRefs = getParameterRefs(inferred.parameters);
        if (parameterRefs.length > 0) {
          paths[fullPath].parameters = parameterRefs;
        }

        paths[fullPath][route.method] = compileRouteOperationWithRefs(route, resolver, inferred, context);
      }
    }
  }

  return { paths, inferredComponents: allInferredComponents };
}

function findPathParameters(parameters: RoutePathParameterMap | undefined, routePath: string): RouteParameterMap | undefined {
  if (!parameters) return undefined;

  const openApiRoutePath = expressPathToOpenApi(routePath);

  for (const [pattern, paramMap] of Object.entries(parameters)) {
    if (expressPathToOpenApi(pattern) === openApiRoutePath) {
      return paramMap;
    }
  }

  return undefined;
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
): OpenApiOperation {
  const operation: OpenApiOperation = {
    operationId: route.operationId,
    tags: route.tags,
    summary: route.summary,
    description: route.description,
    responses: compileResponsesWithRefs(route, inferred),
  };

  // Use component ref for request body
  if (route.body) {
    for (const body of inferred.requestBodies.values()) {
      operation.requestBody = { $ref: `#/components/requestBodies/${body.name}` };
      break;
    }
  }

  return operation;
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
