import { EngineIdPart, createEngineId } from '../ids/engine-id.js';
import type { OptionalResourceContext } from '../resource/resource-context.types.js';
import { SdkKind, SdkPlacement } from '../sdk/sdk-extension.types.js';
import type { DefineRoutesInput, RouteDefinition, RoutePathParameterMap, RouteRegistry } from './route.types.js';

export interface DefineRoutesOptions extends OptionalResourceContext {
  name: string;
}

export function defineRoutes(options: DefineRoutesOptions, input: DefineRoutesInput): RouteRegistry {
  const normalized = normalizeRoutesInput(input);

  const normalizedRoutes = Object.fromEntries(
    Object.entries(normalized.routes).map(([key, route]) => [key, withRouteMeta(options, key, route)]),
  );

  return {
    name: options.name,
    routes: normalizedRoutes,
    parameters: normalized.parameters,
  };
}

function normalizeRoutesInput(input: DefineRoutesInput): {
  parameters?: RoutePathParameterMap;
  routes: Record<string, RouteDefinition>;
} {
  if ('routes' in input) {
    return input as { parameters?: RoutePathParameterMap; routes: Record<string, RouteDefinition> };
  }
  return { routes: input };
}

function withRouteMeta(options: DefineRoutesOptions, key: string, route: RouteDefinition): RouteDefinition {
  const operationId = createOperationId(key);

  return {
    ...route,
    operationId,
    tags: [options.resource?.tag].filter((tag): tag is string => Boolean(tag)),
    meta: {
      kind: SdkKind.operation,
      placement: getPlacement(options),
      group: options.resource?.group,
      resource: options.resource?.key,
      operation: toSnakeCase(key),
      method: route.method,
      path: route.path,
      refId: createScopedId(options, EngineIdPart.operation, key),
    },
  };
}

function createOperationId(key: string): string {
  return key;
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-.\s]+/g, '_')
    .toLowerCase();
}

function createScopedId(options: DefineRoutesOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);

  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineRoutesOptions): SdkPlacement {
  return options.resource ? SdkPlacement.operationLocal : SdkPlacement.globalShared;
}
