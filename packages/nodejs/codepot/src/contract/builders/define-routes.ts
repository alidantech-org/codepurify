// src/contract/builders/define-routes.ts

import { HttpMethod } from '@/contract/types/resource/route/definition';

import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RouteMethodDefinition, RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';
import type { Ref } from '@/contract/types/ref';

import { AuthoringRefKind, type OperationAuthoringRef, type RouteAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  DefineRoutesFactoryInput,
  RouteDefinitionInput,
  RouteHelper,
  RouteInlineRequestInput,
  RouteInlineResponseInput,
  RouteMethodChain,
  RouteRequestHelper,
  RouteResponseHelper,
  RoutesBuilder,
  RoutesBuilderResult,
} from '@/contract/types/core/7.routes-builder';

import { createAuthoringRef, refPath } from '@/contract/helpers/refs/create-authoring-ref';

import { isAuthoringRef, isRefUsage, normalizeRefOrUsage } from '@/pipeline/compiler/refs/normalize-ref-usage';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineRoutesOptions {
  readonly resourceKey: string;
  readonly routes: RoutesDefinition;
  readonly operations: Record<string, OperationDefinition>;
}

// ============================================================================
// PATHS / REFS
// ============================================================================

function routePath(resourceKey: string, key: string): Ref<RoutePathDefinition> {
  return refPath<RoutePathDefinition>(`#/resources/${resourceKey}/routes/${key}`);
}

function operationPath(resourceKey: string, key: string): Ref<OperationDefinition> {
  return refPath<OperationDefinition>(`#/resources/${resourceKey}/operations/${key}`);
}

function createRouteRef(resourceKey: string, key: string): RouteAuthoringRef {
  return createAuthoringRef({
    path: routePath(resourceKey, key),
    kind: AuthoringRefKind.resourceRoute,
    key,
    name: key,
  });
}

function createOperationRef(resourceKey: string, key: string): OperationAuthoringRef {
  return createAuthoringRef({
    path: operationPath(resourceKey, key),
    kind: AuthoringRefKind.resourceOperation,
    key,
    name: key,
  });
}

// ============================================================================
// RESPONSE / REQUEST HELPERS
// ============================================================================

const routeResponse: RouteResponseHelper = {
  json(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'application/json',
    };
  },

  text(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'text/plain',
    };
  },

  binary(options = {}) {
    return {
      ...options,
      contentType: 'application/octet-stream',
    };
  },

  empty(options = {}) {
    return {
      ...options,
    };
  },

  contentType(contentType, schema, options = {}) {
    return {
      ...options,
      contentType,
      schema,
    };
  },

  ref(ref) {
    return ref;
  },
};

const routeRequest: RouteRequestHelper = {
  json(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'application/json',
    };
  },

  form(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'application/x-www-form-urlencoded',
    };
  },

  multipart(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'multipart/form-data',
    };
  },

  contentType(contentType, schema, options = {}) {
    return {
      ...options,
      contentType,
      schema,
    };
  },

  ref(ref) {
    return ref;
  },
};

// ============================================================================
// ROUTE CHAIN
// ============================================================================

function createRouteChain(method: HttpMethod, path: string, input: Partial<RouteDefinitionInput> = {}): RouteMethodChain {
  const current: RouteDefinitionInput = {
    ...input,
    method,
    path,
    responses: input.responses ?? {},
  };

  return {
    method,
    path,
    description: current.description,
    deprecated: current.deprecated,
    meta: current.meta,

    params(params) {
      return createRouteChain(method, path, { ...current, params });
    },

    query(query) {
      return createRouteChain(method, path, { ...current, query });
    },

    body(body) {
      return createRouteChain(method, path, { ...current, body });
    },

    security(security) {
      return createRouteChain(method, path, { ...current, security });
    },

    responses(responses) {
      return {
        ...current,
        responses,
      };
    },

    operation(operation) {
      return createRouteChain(method, path, { ...current, operation });
    },
  };
}

const routeHelper: RouteHelper = {
  response: routeResponse,
  request: routeRequest,

  get(path) {
    return createRouteChain(HttpMethod.get, path);
  },

  post(path) {
    return createRouteChain(HttpMethod.post, path);
  },

  put(path) {
    return createRouteChain(HttpMethod.put, path);
  },

  patch(path) {
    return createRouteChain(HttpMethod.patch, path);
  },

  delete(path) {
    return createRouteChain(HttpMethod.delete, path);
  },

  options(path) {
    return createRouteChain(HttpMethod.options, path);
  },

  head(path) {
    return createRouteChain(HttpMethod.head, path);
  },
};

// ============================================================================
// STATE
// ============================================================================

function normalizeMaybeSchema(value: unknown): unknown {
  if (!value) return undefined;

  if (isAuthoringRef(value) || isRefUsage(value)) {
    return normalizeRefOrUsage(value);
  }

  return value;
}

function normalizeInlineResponse(value: unknown): unknown {
  if (!value) return undefined;
  if (isAuthoringRef(value)) {
    return value.path;
  }

  const obj = value as Record<string, unknown>;
  return {
    ...obj,
    schema: normalizeMaybeSchema(obj.schema),
  };
}

function normalizeInlineRequest(value: unknown): unknown {
  if (!value) return undefined;
  if (isAuthoringRef(value)) {
    return value.path;
  }

  const obj = value as Record<string, unknown>;
  return {
    ...obj,
    schema: normalizeMaybeSchema(obj.schema),
  };
}

function normalizeSecurity(value: unknown): unknown {
  if (!value) return undefined;
  if (isAuthoringRef(value)) {
    return value.path;
  }
  if (Array.isArray(value)) {
    return value.map((item) => (isAuthoringRef(item) ? item.path : item));
  }
  return value;
}

function toRoutePathDefinition(input: RouteDefinitionInput, operation: OperationAuthoringRef): RoutePathDefinition {
  const methodDefinition: RouteMethodDefinition = {
    operation: operation.path,
    security: normalizeSecurity(input.security) as unknown as RouteMethodDefinition['security'],
    query: normalizeInlineRequest(input.query) as unknown as RouteMethodDefinition['query'],
    body: normalizeInlineRequest(input.body) as unknown as RouteMethodDefinition['body'],
    responses: Object.fromEntries(
      Object.entries(input.responses).map(([status, response]) => [Number(status), normalizeInlineResponse(response)]),
    ) as RouteMethodDefinition['responses'],
    description: input.description,
    deprecated: input.deprecated,
    meta: input.meta,
  };

  return {
    methods: {
      [input.method]: methodDefinition,
    },
  };
}

function toOperationDefinition(input: RouteDefinitionInput): OperationDefinition {
  return {
    input: {
      params: input.params as unknown as NonNullable<OperationDefinition['input']>['params'],
      query: input.query as unknown as NonNullable<OperationDefinition['input']>['query'],
      body: input.body as unknown as NonNullable<OperationDefinition['input']>['body'],
    },
    output: {
      result: undefined,
      errors: undefined,
    },
    description: input.description,
    deprecated: input.deprecated,
    meta: input.meta,
  };
}

// ============================================================================
// DEFINE ROUTES
// ============================================================================

export function defineRoutes(options: DefineRoutesOptions): RoutesBuilder {
  const builder: RoutesBuilder = {
    get state() {
      return {
        routes: options.routes,
        operations: options.operations,
      };
    },

    define<TInput extends DefineRoutesFactoryInput>(
      routesOrFactory: TInput | ((route: RouteHelper) => TInput),
    ): RoutesBuilderResult<TInput> {
      const input = typeof routesOrFactory === 'function' ? routesOrFactory(routeHelper) : routesOrFactory;

      const refs = {} as Record<keyof TInput & string, RouteAuthoringRef>;

      for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
        const operation = value.operation ?? createOperationRef(options.resourceKey, key);

        options.operations[key] = toOperationDefinition(value);
        options.routes[key] = toRoutePathDefinition(value, operation);
        refs[key] = createRouteRef(options.resourceKey, key);
      }

      return {
        routes: input,
        ref: refs as RoutesBuilderResult<TInput>['ref'],
      };
    },

    addRoute(key, route) {
      options.routes[key] = route;
      return builder;
    },

    addOperation(key, operation) {
      options.operations[key] = operation;
      return builder;
    },

    snapshot() {
      return {
        routes: options.routes,
        operations: options.operations,
      };
    },
  };

  return builder;
}
