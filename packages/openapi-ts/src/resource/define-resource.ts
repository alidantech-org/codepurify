import { defineComponents } from "../components/define-components.js";
import type { ComponentRegistry } from "../components/component.types.js";
import { defineProperties } from "../properties/define-properties.js";
import type { PropertyRegistry } from "../properties/property.types.js";
import { defineRoutes } from "../routes/define-routes.js";
import type { RouteRegistry } from "../routes/route.types.js";
import type { ResourceContext } from "./resource-context.types.js";

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
  readonly components: ComponentRegistry[];
  readonly routes: RouteRegistry[];

  defineProperties(name?: string): ReturnType<typeof defineProperties>;

  defineComponents(
    components: Parameters<typeof defineComponents>[1],
    name?: string,
  ): ReturnType<typeof defineComponents>;

  defineRoutes(
    routes: Parameters<typeof defineRoutes>[1],
    name?: string,
  ): ReturnType<typeof defineRoutes>;
}

export function defineResource(
  options: DefineResourceOptions,
): ResourceBuilder {
  const context: ResourceContext = {
    key: options.key,
    name: options.name,
    basePath: options.basePath,
    tag: options.tag ?? options.name,
    group: options.group ?? options.key,
  };

  const properties: PropertyRegistry[] = [];
  const components: ComponentRegistry[] = [];
  const routes: RouteRegistry[] = [];

  function defineResourceProperties(name?: string) {
    const registry = defineProperties({
      name: name ?? context.key,
      resource: context,
    });

    properties.push(registry.registry());
    return registry;
  }

  function defineResourceComponents(
    input: Parameters<typeof defineComponents>[1],
    name?: string,
  ) {
    const registry = defineComponents(
      {
        name: name ?? context.key,
        resource: context,
      },
      input,
    );

    components.push(registry);
    return registry;
  }

  function defineResourceRoutes(
    input: Parameters<typeof defineRoutes>[1],
    name?: string,
  ) {
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
    components,
    routes,
    defineProperties: defineResourceProperties,
    defineComponents: defineResourceComponents,
    defineRoutes: defineResourceRoutes,
  };
}
