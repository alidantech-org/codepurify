import { EngineIdPart, createEngineId } from "../ids/engine-id";
import type { OptionalResourceContext } from "../resource/resource-context.types.js";
import { SdkKind, SdkPlacement } from "../sdk/sdk-extension.types.js";
import type { RouteDefinition, RouteRegistry } from "./route.types.js";

export interface DefineRoutesOptions extends OptionalResourceContext {
  name: string;
}

export function defineRoutes(
  options: DefineRoutesOptions,
  routes: Record<string, RouteDefinition>,
): RouteRegistry {
  const normalizedRoutes = Object.fromEntries(
    Object.entries(routes).map(([key, route]) => [
      key,
      withRouteMeta(options, key, route),
    ]),
  );

  return {
    name: options.name,
    routes: normalizedRoutes,
  };
}

function withRouteMeta(
  options: DefineRoutesOptions,
  key: string,
  route: RouteDefinition,
): RouteDefinition {
  const operationId = createOperationId(options, key);

  return {
    ...route,
    operationId,
    tags: [options.resource?.tag].filter((tag): tag is string => Boolean(tag)),
    meta: {
      kind: SdkKind.operation,
      placement: getPlacement(options),
      group: options.resource?.group,
      resource: options.resource?.key,
      operation: operationId,
      method: route.method,
      path: route.path,
      refId: createScopedId(options, EngineIdPart.operation, key),
    },
  };
}

function createOperationId(options: DefineRoutesOptions, key: string): string {
  if (!options.resource) return key;

  return `${options.resource.key}.${key}`;
}

function createScopedId(
  options: DefineRoutesOptions,
  ...parts: string[]
): string {
  if (!options.resource) return createEngineId(...parts);

  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineRoutesOptions): SdkPlacement {
  return options.resource
    ? SdkPlacement.operationLocal
    : SdkPlacement.globalShared;
}
