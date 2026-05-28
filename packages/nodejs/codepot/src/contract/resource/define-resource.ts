import type { PropertyRegistry } from '../properties/property.types';

import { defineRoutes } from '../routes/define-routes';
import type { RouteRegistry } from '../routes/route.types';

import type { ResourceContext } from './resource-context.types';
import { defineProperties } from '../properties/define-properties';

import { SchemaComponentRegistry, SchemaComponentValue } from '@/contract/schema/schemas/schema-component.types';
import { defineParameters } from '@/pipeline/targets/openapi/components/parameters/define-parameters';
import {
  ParameterComponentRegistry,
  ParameterComponentDefinition,
} from '@/pipeline/targets/openapi/components/parameters/parameter-component.types';
import { defineRequestBodies } from '@/pipeline/targets/openapi/components/request-bodies/define-request-bodies';
import {
  RequestBodyComponentRegistry,
  RequestBodyComponentDefinition,
} from '@/pipeline/targets/openapi/components/request-bodies/request-body-component.types';
import { defineResponses } from '@/pipeline/targets/openapi/components/responses/define-responses';
import {
  ResponseComponentRegistry,
  ResponseComponentDefinition,
} from '@/pipeline/targets/openapi/components/responses/response-component.types';
import { defineSchemas } from '@/contract/schema/schemas/define-schemas';

export interface DefineResourceOptions {
  /**
   * Stable machine key.
   * Example: "users", "vehicle_brands"
   */
  key: string;

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
    key: options.key,
    name: options.name,
    route: options.route,
    tag: options.tag ?? options.name,
    folders: normalizeFolders(options.folders),
    alias: options.alias ?? options.key,
  };

  const properties: PropertyRegistry[] = [];
  const schemaComponents: SchemaComponentRegistry[] = [];
  const parameterComponents: ParameterComponentRegistry[] = [];
  const requestBodyComponents: RequestBodyComponentRegistry[] = [];
  const responseComponents: ResponseComponentRegistry[] = [];
  const routes: RouteRegistry[] = [];

  function defineResourceProperties(name?: string) {
    const registry = defineProperties({
      name: name ?? context.key,
      resource: context,
    });

    properties.push(registry.registry());
    return registry;
  }

  function defineResourceSchemas<TInput extends Record<string, SchemaComponentValue>>(input: TInput, name?: string) {
    const registry = defineSchemas(
      {
        name: name ?? context.key,
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
        name: name ?? context.key,
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
        name: name ?? context.key,
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
        name: name ?? context.key,
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
        name: name ?? context.key,
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
