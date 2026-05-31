// src/contract/builders/define-routes.ts

import { HttpMethod } from '@/contract/types/resource/route/definition';

import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';

import type { OperationAuthoringRef, RouteAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  DefineRoutesFactoryInput,
  RouteDefinitionInput,
  RouteHelper,
  RouteMethodChain,
  RouteParamsInput,
  RouteRequestHelper,
  RouteResponseHelper,
  RoutesBuilder,
  RoutesBuilderResult,
} from '@/contract/types/core/7.routes-builder';

import { operationRef, routeRef } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineRoutesOptions {
  readonly resourceKey: string;
  readonly routes: RoutesDefinition;
  readonly operations: Record<string, OperationDefinition>;
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
// PARAM HELPERS
// ============================================================================

function normalizeRouteParams(params: RouteParamsInput): RouteParamsInput {
  if (params && typeof params === 'object' && 'params' in params && 'ref' in params) {
    return params.params as RouteParamsInput;
  }

  return params;
}

// ============================================================================
// ROUTE CHAIN
// ============================================================================

function createRouteInput(method: HttpMethod, path: string, input: Partial<RouteDefinitionInput> = {}): RouteDefinitionInput {
  return {
    ...input,
    method,
    path,
    responses: input.responses ?? {},
  };
}

function createRouteChain(method: HttpMethod, path: string, input: Partial<RouteDefinitionInput> = {}): RouteMethodChain {
  const current = createRouteInput(method, path, input);

  return {
    method,
    path,
    description: current.description,
    deprecated: current.deprecated,
    meta: current.meta,

    params(params) {
      return createRouteChain(method, path, {
        ...current,
        params: normalizeRouteParams(params),
      });
    },

    query(query) {
      return createRouteChain(method, path, {
        ...current,
        query,
      });
    },

    body(body) {
      return createRouteChain(method, path, {
        ...current,
        body,
      });
    },

    security(security) {
      return createRouteChain(method, path, {
        ...current,
        security,
      });
    },

    operation(operation) {
      return createRouteChain(method, path, {
        ...current,
        operation,
      });
    },

    responses(responses) {
      return {
        ...current,
        responses,
      };
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
// STATE HELPERS
// ============================================================================

function createRouteRefs<TInput extends DefineRoutesFactoryInput>(
  resourceKey: string,
  input: TInput,
): Record<keyof TInput & string, RouteAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, RouteAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = routeRef(resourceKey, key);
  }

  return refs;
}

function writeRoutes<TInput extends DefineRoutesFactoryInput>(options: DefineRoutesOptions, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    writeRoute(options, key, value);
  }
}

function writeRoute(options: DefineRoutesOptions, key: string, value: RouteDefinitionInput): void {
  const operation = value.operation ?? operationRef(options.resourceKey, key);

  options.operations[key] = createOperationState(value, operation);
  options.routes[key] = value as unknown as RoutePathDefinition;
}

function createOperationState(value: RouteDefinitionInput, operation: OperationAuthoringRef): OperationDefinition {
  return {
    description: value.description,
    deprecated: value.deprecated,
    meta: {
      ...(value.meta ?? {}),
      operationRef: operation,
    },
  } as unknown as OperationDefinition;
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

      writeRoutes(options, input);

      return {
        routes: input,
        ref: createRouteRefs(options.resourceKey, input) as RoutesBuilderResult<TInput>['ref'],
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
