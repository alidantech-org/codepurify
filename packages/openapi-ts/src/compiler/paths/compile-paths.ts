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

        paths[fullPath] ??= {};

        paths[fullPath][route.method] = compileRouteOperationWithRefs(route, resolver, inferred, context);
      }
    }
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
): OpenApiOperation {
  const operation: OpenApiOperation = {
    operationId: route.operationId,
    tags: route.tags,
    summary: route.summary,
    description: route.description,
    responses: compileResponsesWithRefs(route, inferred),
  };

  // Use component refs for parameters
  const routeParams = getParameterRefsForRoute(route, inferred);
  if (routeParams.length > 0) {
    operation.parameters = routeParams;
  }

  // Use component ref for request body
  if (route.body) {
    for (const body of inferred.requestBodies.values()) {
      operation.requestBody = { $ref: `#/components/requestBodies/${body.name}` };
      break;
    }
  }

  // Add x-codegen metadata with target if route.query is a ComponentRef or RefUsage<ComponentRef>
  if (route.meta) {
    const codegenMeta: CodegenMetadata = route.meta;

    if (route.query) {
      let queryRef: ComponentRef | undefined;
      if (isComponentRef(route.query)) {
        queryRef = route.query;
      } else if (isRefUsage(route.query) && isComponentRef(route.query.ref)) {
        queryRef = route.query.ref;
      }

      if (queryRef) {
        const schemaName = resolver.schemas.get(queryRef.id);
        if (schemaName) {
          (codegenMeta as any).target = { $ref: `#/components/schemas/${schemaName}` };
        }
      }
    }

    return applyCodegenMetadata(operation as unknown as Record<string, unknown>, codegenMeta) as unknown as OpenApiOperation;
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
