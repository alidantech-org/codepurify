import { EngineIdPart, createEngineId } from '../ids/engine-id.js';
import type { OptionalResourceContext } from '../resource/resource-context.types.js';
import { XCodegenDtoRole, XCodegenKind } from '../sdk/codegen-extension.types.js';
import type { DefineRoutesInput, RouteDefinition, RouteParameterRegistry, RouteRegistry } from './route.types.js';

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
  parameters?: RouteParameterRegistry;
  routes: Record<string, RouteDefinition>;
} {
  if ('routes' in input) {
    const normalized = input as { parameters?: RouteParameterRegistry; routes: Record<string, RouteDefinition> };

    // Validate that parameters use parameter names, not path patterns
    if (normalized.parameters) {
      for (const key of Object.keys(normalized.parameters)) {
        if (key.startsWith('/') || key.includes(':')) {
          throw new Error(
            `defineRoutes.parameters must be keyed by parameter name, not path pattern. Use { ${key.replace(/^\/:?/, '')}: ref } instead of { ${key}: ref }.`,
          );
        }
      }
    }

    return normalized;
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
      kind: XCodegenKind.dto,
      role: XCodegenDtoRole.body,
      ...(!options.resource ? { shared: true } : {}),
      resource: options.resource
        ? {
            name: options.resource.alias,
            path: options.resource.folders,
          }
        : undefined,
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
