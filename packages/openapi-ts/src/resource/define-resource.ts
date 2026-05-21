import { defineSchemas } from '../components/schemas/define-schemas.js';
import type { SchemaComponentRegistry } from '../components/schemas/schema-component.types.js';
import { defineParameters } from '../components/parameters/define-parameters.js';
import type { ParameterComponentRegistry } from '../components/parameters/parameter-component.types.js';
import { defineRequestBodies } from '../components/request-bodies/define-request-bodies.js';
import type { RequestBodyComponentRegistry } from '../components/request-bodies/request-body-component.types.js';
import { defineResponses } from '../components/responses/define-responses.js';
import type { ResponseComponentRegistry } from '../components/responses/response-component.types.js';
import { defineProperties } from '../properties/define-properties.js';
import type { PropertyRegistry } from '../properties/property.types.js';
import { defineRoutes } from '../routes/define-routes.js';
import type { RouteRegistry } from '../routes/route.types.js';
import type { ResourceContext } from './resource-context.types.js';

export interface DefineResourceOptions {
  key: string;
  name: string;
  basePath: string;
  tag?: string;
  group?: string;
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

  readonly components: {
    defineSchemas(input: Parameters<typeof defineSchemas>[1], name?: string): ReturnType<typeof defineSchemas>;
    defineParameters(input: Parameters<typeof defineParameters>[1], name?: string): ReturnType<typeof defineParameters>;
    defineRequestBodies(input: Parameters<typeof defineRequestBodies>[1], name?: string): ReturnType<typeof defineRequestBodies>;
    defineResponses(input: Parameters<typeof defineResponses>[1], name?: string): ReturnType<typeof defineResponses>;
  };

  defineRoutes(routes: Parameters<typeof defineRoutes>[1], name?: string): ReturnType<typeof defineRoutes>;
}

export function defineResource(options: DefineResourceOptions): ResourceBuilder {
  const context: ResourceContext = {
    key: options.key,
    name: options.name,
    basePath: options.basePath,
    tag: options.tag ?? options.name,
    group: options.group ?? options.key,
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

  function defineResourceSchemas(input: Parameters<typeof defineSchemas>[1], name?: string) {
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

  function defineResourceParameters(input: Parameters<typeof defineParameters>[1], name?: string) {
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

  function defineResourceRequestBodies(input: Parameters<typeof defineRequestBodies>[1], name?: string) {
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

  function defineResourceResponses(input: Parameters<typeof defineResponses>[1], name?: string) {
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
    components: {
      defineSchemas: defineResourceSchemas,
      defineParameters: defineResourceParameters,
      defineRequestBodies: defineResourceRequestBodies,
      defineResponses: defineResourceResponses,
    },
    defineRoutes: defineResourceRoutes,
  };
}
