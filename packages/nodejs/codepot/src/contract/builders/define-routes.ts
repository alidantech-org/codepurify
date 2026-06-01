// src/contract/builders/define-routes.ts

import { HttpMethod } from '@/contract/types/resource/route/definition';

import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';

import type { OperationAuthoringRef, RouteAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  DefineRoutesFactoryInput,
  RouteDefinitionInput,
  RouteErrorInput,
  RouteHelper,
  RouteMethodChain,
  RouteOutputOptions,
  RouteParamsInput,
  RouteSchemaInput,
  RoutesBuilder,
  RoutesBuilderResult,
} from '@/contract/types/core/7.routes-builder';

import type { ContentDefinition } from '@/contract/types/errors/definition';

import { content } from '@/contract/helpers/content/content';

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
// NORMALIZATION HELPERS
// ============================================================================

function normalizeRouteParams(params: RouteParamsInput): RouteParamsInput {
  if (params && typeof params === 'object' && 'params' in params && 'ref' in params) {
    return params.params as RouteParamsInput;
  }

  return params;
}

function normalizeContent(contentValue?: readonly ContentDefinition[] | ContentDefinition): readonly ContentDefinition[] | undefined {
  if (contentValue === undefined) return undefined;

  return (Array.isArray(contentValue) ? contentValue : [contentValue]) as readonly ContentDefinition[];
}

function isContentDefinition(value: unknown): value is ContentDefinition {
  return !!value && typeof value === 'object' && 'type' in value && typeof (value as { type: unknown }).type === 'string';
}

function isContentDefinitionList(value: unknown): value is readonly ContentDefinition[] | ContentDefinition {
  return isContentDefinition(value) || (Array.isArray(value) && value.every(isContentDefinition));
}

function normalizeOutputOptions(
  contentOrOptions?: readonly ContentDefinition[] | ContentDefinition | RouteOutputOptions,
): RouteOutputOptions {
  if (contentOrOptions === undefined) return {};

  if (isContentDefinitionList(contentOrOptions)) {
    return {
      content: contentOrOptions,
    };
  }

  return contentOrOptions;
}

function createOutput(
  schema: RouteSchemaInput | undefined,
  status: number,
  contentOrOptions?: readonly ContentDefinition[] | ContentDefinition | RouteOutputOptions,
) {
  const options = normalizeOutputOptions(contentOrOptions);

  return {
    ...options,
    status: options.status ?? status,
    ...(schema === undefined ? {} : { schema }),
    content: normalizeContent(options.content),
  };
}

// ============================================================================
// ROUTE CHAIN
// ============================================================================

function createRouteInput(method: HttpMethod, path: string, input: Partial<RouteDefinitionInput> = {}): RouteDefinitionInput {
  return {
    ...input,
    method,
    path,
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

    body(schema, contentValue) {
      return createRouteChain(method, path, {
        ...current,
        body: {
          schema,
          content: normalizeContent(contentValue),
        },
      });
    },

    security(security) {
      return createRouteChain(method, path, {
        ...current,
        security,
      });
    },

    output(schema, contentOrOptions) {
      return {
        ...current,
        output: createOutput(schema, 200, contentOrOptions),
      };
    },

    created(schema, contentOrOptions) {
      return {
        ...current,
        output: createOutput(schema, 201, contentOrOptions),
      };
    },

    noContent(options = {}) {
      return {
        ...current,
        output: {
          ...options,
          status: options.status ?? 204,
        },
      };
    },

    errors(...errors: readonly RouteErrorInput[]) {
      return createRouteChain(method, path, {
        ...current,
        errors,
      });
    },

    responses(responses) {
      return {
        ...current,
        responses,
      };
    },

    operation(operation) {
      return createRouteChain(method, path, {
        ...current,
        operation,
      });
    },
  };
}

const routeHelper: RouteHelper = {
  content,

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
