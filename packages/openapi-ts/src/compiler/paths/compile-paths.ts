import type { OpenApiPaths } from "../../openapi/openapi.types.js";
import type { VersionContract } from "../../version/version-contract.types.js";
import type { RefResolver } from "../refs/ref-resolver.types.js";
import { compileRouteOperation } from "./compile-route-operation";
import { expressPathToOpenApi } from "./express-path-to-openapi";

export function compilePaths(
  contract: VersionContract,
  resolver: RefResolver,
): OpenApiPaths {
  const paths: OpenApiPaths = {};

  for (const resource of contract.resources) {
    for (const registry of resource.routes) {
      for (const route of Object.values(registry.routes)) {
        const fullPath = expressPathToOpenApi(
          `${resource.context.basePath}${route.path}`,
        );

        paths[fullPath] ??= {};
        paths[fullPath][route.method] = compileRouteOperation(route, resolver);
      }
    }
  }

  return paths;
}
