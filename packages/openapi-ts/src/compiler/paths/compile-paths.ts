import type { OpenApiPaths } from '../../openapi/openapi.types.js';
import type { VersionContract } from '../../version/version-contract.types.js';
import type { ParameterRef } from '../../refs/ref.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { toParameterOpenApiRef } from '../refs/to-component-bucket-ref.js';
import { compileRouteOperation } from './compile-route-operation.js';
import { expressPathToOpenApi } from './express-path-to-openapi.js';
import type { RoutePathParameterMap } from '../../routes/route.types.js';

export function compilePaths(contract: VersionContract, resolver: RefResolver): OpenApiPaths {
  const paths: OpenApiPaths = {};

  for (const resource of contract.resources) {
    for (const registry of resource.routes) {
      for (const route of Object.values(registry.routes)) {
        const fullPath = expressPathToOpenApi(`${resource.context.basePath}${route.path}`);
        const pathParams = findPathParameters(registry.parameters, route.path);

        paths[fullPath] ??= {};

        if (pathParams.length > 0 && !paths[fullPath].parameters) {
          paths[fullPath].parameters = pathParams.map((ref) => toParameterOpenApiRef(ref, resolver));
        }

        paths[fullPath][route.method] = compileRouteOperation(route, resolver, contract.defaultResponses);
      }
    }
  }

  return paths;
}

function findPathParameters(parameters: RoutePathParameterMap | undefined, routePath: string): readonly ParameterRef[] {
  if (!parameters) return [];

  const openApiRoutePath = expressPathToOpenApi(routePath);

  for (const [pattern, refs] of Object.entries(parameters)) {
    if (expressPathToOpenApi(pattern) === openApiRoutePath) {
      return refs;
    }
  }

  return [];
}
