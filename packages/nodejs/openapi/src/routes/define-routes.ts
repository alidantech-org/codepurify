import { EngineIdPart, createEngineId } from '../ids/engine-id.js';
import type { OptionalResourceContext } from '../resource/resource-context.types.js';
import { XCodegenDtoRole, XCodegenKind } from '../codegen/codegen-extension.types.js';
import type { CodegenUiInput } from '../codegen/codegen-extension.types.js';
import { normalizeCodegenUiInput } from '../codegen/codegen-ui.js';
import { HttpMethod } from './http-method.js';
import type {
  DefineRoutesBuilderInput,
  DefineRoutesInput,
  DefineRoutesInputLike,
  RouteBodyInput,
  RouteDefinition,
  RouteParameterRegistry,
  RouteQueryInput,
  RouteRegistry,
  RouteResponseInput,
  RoutesBuilder,
} from './route.types.js';

type MutableRouteDefinition = {
  -readonly [K in keyof RouteDefinition]: RouteDefinition[K];
};

export interface DefineRoutesOptions extends OptionalResourceContext {
  name: string;
}

export function defineRoutes(options: DefineRoutesOptions, input: DefineRoutesInputLike): RouteRegistry {
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

function normalizeRoutesInput(input: DefineRoutesInputLike): {
  parameters?: RouteParameterRegistry;
  routes: Record<string, RouteDefinition>;
} {
  if (typeof input === 'function') {
    const builder = new FluentRoutesBuilder();
    const returnedBuilder = (input as DefineRoutesBuilderInput)(builder);
    return (returnedBuilder ?? builder).build();
  }

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

class FluentRoutesBuilder implements RoutesBuilder {
  private parameters?: RouteParameterRegistry;
  private routes: Record<string, RouteDefinition> = {};
  private current?: { key: string; route: MutableRouteDefinition };

  params(parameters: RouteParameterRegistry): RoutesBuilder {
    if (this.current) {
      this.current.route.params = parameters;
      return this;
    }

    this.parameters = parameters;
    return this;
  }

  get(path: string, name: string): RoutesBuilder {
    return this.open(HttpMethod.get, path, name);
  }

  post(path: string, name: string): RoutesBuilder {
    return this.open(HttpMethod.post, path, name);
  }

  put(path: string, name: string): RoutesBuilder {
    return this.open(HttpMethod.put, path, name);
  }

  patch(path: string, name: string): RoutesBuilder {
    return this.open(HttpMethod.patch, path, name);
  }

  delete(path: string, name: string): RoutesBuilder {
    return this.open(HttpMethod.delete, path, name);
  }

  summary(summary: string): RoutesBuilder {
    this.activeRoute().summary = summary;
    return this;
  }

  description(description: string): RoutesBuilder {
    this.activeRoute().description = description;
    return this;
  }

  query(query: RouteQueryInput): RoutesBuilder {
    this.activeRoute().query = query;
    return this;
  }

  body(body: RouteBodyInput): RoutesBuilder {
    this.activeRoute().body = body;
    return this;
  }

  response(response: RouteResponseInput): RoutesBuilder {
    this.activeRoute().response = response;
    return this;
  }

  on(status: number, response: RouteResponseInput): RoutesBuilder {
    const route = this.activeRoute();
    route.responses = {
      ...(route.responses ?? {}),
      [status]: response,
    };
    return this;
  }

  ui(roleOrMeta: CodegenUiInput): RoutesBuilder {
    this.activeRoute().ui = normalizeCodegenUiInput(roleOrMeta);
    return this;
  }

  done(): RoutesBuilder {
    this.flush();
    return this;
  }

  build(): {
    parameters?: RouteParameterRegistry;
    routes: Record<string, RouteDefinition>;
  } {
    this.flush();

    return {
      parameters: this.parameters,
      routes: this.routes,
    };
  }

  private open(method: RouteDefinition['method'], path: string, name: string): RoutesBuilder {
    this.flush();
    this.current = {
      key: name,
      route: {
        method,
        path,
      },
    };
    return this;
  }

  private activeRoute(): MutableRouteDefinition {
    if (!this.current) {
      throw new Error('defineRoutes builder route methods must be called after an HTTP method, for example .get("/", "listItems").');
    }

    return this.current.route;
  }

  private flush(): void {
    if (!this.current) return;

    this.routes[this.current.key] = this.current.route;
    this.current = undefined;
  }
}

function withRouteMeta(options: DefineRoutesOptions, key: string, route: RouteDefinition): RouteDefinition {
  const operationId = createOperationId(key);

  return {
    ...route,
    ui: normalizeCodegenUiInput(route.ui),
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

  return createEngineId(EngineIdPart.resource, options.resource.name, ...parts);
}
