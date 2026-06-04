import { defineSchemas } from '../components/schemas/define-schemas.js';
import type { SchemaComponentRegistry, SchemaComponentValue } from '../components/schemas/schema-component.types.js';

import { defineParameters } from '../components/parameters/define-parameters.js';
import type { ParameterComponentRegistry, ParameterComponentDefinition } from '../components/parameters/parameter-component.types.js';

import { defineRequestBodies } from '../components/request-bodies/define-request-bodies.js';
import type {
  RequestBodyComponentRegistry,
  RequestBodyComponentDefinition,
} from '../components/request-bodies/request-body-component.types.js';

import { defineResponses } from '../components/responses/define-responses.js';
import type { ResponseComponentRegistry, ResponseComponentDefinition } from '../components/responses/response-component.types.js';

import type { PropertyRegistry } from '../properties/property.types.js';

import { defineRoutes } from '../routes/define-routes.js';
import type { RouteRegistry } from '../routes/route.types.js';

import type { ResourceContext } from './resource-context.types.js';
import { defineProperties } from '../properties/define-properties.js';

export interface DefineResourceOptions {
  /**
   * Human-readable resource name.
   * Example: "User", "Vehicle Brand"
   */
  name: string;

  /**
   * Actual HTTP URL path.
   * Example: "/users", "/auth/sessions"
   */
  route: string;

  /**
   * Optional OpenAPI tag.
   * Defaults to name.
   */
  tag?: string;

  /**
   * Generated output grouping folders.
   * This is NOT a URL path.
   *
   * Example:
   * ["platform", "auth"]
   * ["references", "vehicles"]
   */
  folders?: readonly string[];

  /**
   * Optional generated resource alias.
   * Defaults to key.
   */
  alias?: string;
}

export interface ResourceBuilder {
  readonly context: ResourceContext;

  readonly properties: PropertyRegistry[];
  readonly schemaComponents: SchemaComponentRegistry[];
  readonly parameterComponents: ParameterComponentRegistry[];
  readonly requestBodyComponents: RequestBodyComponentRegistry[];
  readonly responseComponents: ResponseComponentRegistry[];
  readonly routes: RouteRegistry[];

  defineProperties(name?: string): ReturnType<typeof defineProperties>;

  defineSchemas<TInput extends Record<string, SchemaComponentValue>>(
    input: TInput,
    name?: string,
  ): ReturnType<typeof defineSchemas<TInput>>;

  defineParameters<TInput extends Record<string, Omit<ParameterComponentDefinition, 'key'>>>(
    input: TInput,
    name?: string,
  ): ReturnType<typeof defineParameters<TInput>>;

  defineRequestBodies<TInput extends Record<string, Omit<RequestBodyComponentDefinition, 'name'>>>(
    input: TInput,
    name?: string,
  ): ReturnType<typeof defineRequestBodies<TInput>>;

  defineResponses<TInput extends Record<string, Omit<ResponseComponentDefinition, 'name'>>>(
    input: TInput,
    name?: string,
  ): ReturnType<typeof defineResponses<TInput>>;

  defineRoutes(routes: Parameters<typeof defineRoutes>[1], name?: string): ReturnType<typeof defineRoutes>;
}

function normalizeFolders(folders?: readonly string[]): readonly string[] {
  return folders?.map((folder) => folder.trim()).filter(Boolean) ?? [];
}

export function defineResource(options: DefineResourceOptions): ResourceBuilder {
  const context: ResourceContext = {
    name: options.name,
    route: options.route,
    tag: options.tag ?? options.name,
    folders: normalizeFolders(options.folders),
    alias: options.alias ?? options.name,
  };

  const properties: PropertyRegistry[] = [];
  const schemaComponents: SchemaComponentRegistry[] = [];
  const parameterComponents: ParameterComponentRegistry[] = [];
  const requestBodyComponents: RequestBodyComponentRegistry[] = [];
  const responseComponents: ResponseComponentRegistry[] = [];
  const routes: RouteRegistry[] = [];

  function defineResourceProperties(name?: string) {
    const registry = defineProperties({
      name: name ?? context.name,
      resource: context,
    });

    properties.push(registry.registry());
    return registry;
  }

  function defineResourceSchemas<TInput extends Record<string, SchemaComponentValue>>(input: TInput, name?: string) {
    const registry = defineSchemas(
      {
        name: name ?? context.name,
        resource: context,
      },
      input,
    );

    schemaComponents.push(registry);
    return registry;
  }

  function defineResourceParameters<TInput extends Record<string, Omit<ParameterComponentDefinition, 'key'>>>(
    input: TInput,
    name?: string,
  ) {
    const registry = defineParameters(
      {
        name: name ?? context.name,
        resource: context,
      },
      input,
    );

    parameterComponents.push(registry);
    return registry;
  }

  function defineResourceRequestBodies<TInput extends Record<string, Omit<RequestBodyComponentDefinition, 'name'>>>(
    input: TInput,
    name?: string,
  ) {
    const registry = defineRequestBodies(
      {
        name: name ?? context.name,
        resource: context,
      },
      input,
    );

    requestBodyComponents.push(registry);
    return registry;
  }

  function defineResourceResponses<TInput extends Record<string, Omit<ResponseComponentDefinition, 'name'>>>(input: TInput, name?: string) {
    const registry = defineResponses(
      {
        name: name ?? context.name,
        resource: context,
      },
      input,
    );

    responseComponents.push(registry);
    return registry;
  }

  function defineResourceRoutes(input: Parameters<typeof defineRoutes>[1], name?: string) {
    const registry = defineRoutes(
      {
        name: name ?? context.name,
        resource: context,
      },
      input,
    );

    routes.push(registry);
    return registry;
  }

  return {
    context,
    properties,
    schemaComponents,
    parameterComponents,
    requestBodyComponents,
    responseComponents,
    routes,
    defineProperties: defineResourceProperties,
    defineSchemas: defineResourceSchemas,
    defineParameters: defineResourceParameters,
    defineRequestBodies: defineResourceRequestBodies,
    defineResponses: defineResourceResponses,
    defineRoutes: defineResourceRoutes,
  };
}
