import { defineResource } from '../resource/define-resource.js';
import type { DefineResourceOptions, ResourceBuilder } from '../resource/define-resource.js';
import { defineSchemas } from '../components/schemas/define-schemas.js';
import type { SchemaComponentRegistry } from '../components/schemas/schema-component.types.js';
import { defineParameters } from '../components/parameters/define-parameters.js';
import type { ParameterComponentRegistry } from '../components/parameters/parameter-component.types.js';
import { defineRequestBodies } from '../components/request-bodies/define-request-bodies.js';
import type { RequestBodyComponentRegistry } from '../components/request-bodies/request-body-component.types.js';
import { defineResponses } from '../components/responses/define-responses.js';
import type { ResponseComponentRegistry } from '../components/responses/response-component.types.js';
import type { ResponseRef } from '../refs/ref.types.js';
import type { PropertyRegistry } from '../properties/property.types.js';
import type { VersionContract, VersionInfo } from './version-contract.types.js';

export interface DefineVersionContractOptions {
  info: VersionInfo;
  resources?: ResourceBuilder[];
  properties?: PropertyRegistry[];
  schemaComponents?: SchemaComponentRegistry[];
  parameterComponents?: ParameterComponentRegistry[];
  requestBodyComponents?: RequestBodyComponentRegistry[];
  responseComponents?: ResponseComponentRegistry[];
  defaultResponses?: Record<number, ResponseRef>;
}

export interface VersionBuilder {
  readonly contract: VersionContract;
  defineResource(options: DefineResourceOptions): ResourceBuilder;
  addResource(resource: ResourceBuilder): VersionBuilder;
  addProperties(properties: PropertyRegistry): VersionBuilder;
  readonly components: {
    defineSchemas(input: Parameters<typeof defineSchemas>[1], name?: string): ReturnType<typeof defineSchemas>;
    defineParameters(input: Parameters<typeof defineParameters>[1], name?: string): ReturnType<typeof defineParameters>;
    defineRequestBodies(input: Parameters<typeof defineRequestBodies>[1], name?: string): ReturnType<typeof defineRequestBodies>;
    defineResponses(input: Parameters<typeof defineResponses>[1], name?: string): ReturnType<typeof defineResponses>;
  };
  setDefaultResponses(responses: Record<number, ResponseRef>): VersionBuilder;
}

export function defineVersionContract(options: DefineVersionContractOptions): VersionBuilder {
  const contract: VersionContract = {
    info: options.info,
    resources: [...(options.resources ?? [])],
    properties: [...(options.properties ?? [])],
    schemaComponents: [...(options.schemaComponents ?? [])],
    parameterComponents: [...(options.parameterComponents ?? [])],
    requestBodyComponents: [...(options.requestBodyComponents ?? [])],
    responseComponents: [...(options.responseComponents ?? [])],
    defaultResponses: { ...(options.defaultResponses ?? {}) },
  };

  function defineVersionResource(resourceOptions: DefineResourceOptions): ResourceBuilder {
    const resource = defineResource(resourceOptions);
    contract.resources.push(resource);
    return resource;
  }

  function addResource(resource: ResourceBuilder): VersionBuilder {
    contract.resources.push(resource);
    return builder;
  }

  function addProperties(properties: PropertyRegistry): VersionBuilder {
    contract.properties.push(properties);
    return builder;
  }

  const schemaComponents = contract.schemaComponents;
  const parameterComponents = contract.parameterComponents;
  const requestBodyComponents = contract.requestBodyComponents;
  const responseComponents = contract.responseComponents;

  function defineVersionSchemas(input: Parameters<typeof defineSchemas>[1], name?: string) {
    const registry = defineSchemas(
      {
        name: name ?? 'shared',
      },
      input,
    );

    schemaComponents.push(registry);
    return registry;
  }

  function defineVersionParameters(input: Parameters<typeof defineParameters>[1], name?: string) {
    const registry = defineParameters(
      {
        name: name ?? 'shared',
      },
      input,
    );

    parameterComponents.push(registry);
    return registry;
  }

  function defineVersionRequestBodies(input: Parameters<typeof defineRequestBodies>[1], name?: string) {
    const registry = defineRequestBodies(
      {
        name: name ?? 'shared',
      },
      input,
    );

    requestBodyComponents.push(registry);
    return registry;
  }

  function defineVersionResponses(input: Parameters<typeof defineResponses>[1], name?: string) {
    const registry = defineResponses(
      {
        name: name ?? 'shared',
      },
      input,
    );

    responseComponents.push(registry);
    return registry;
  }

  function setDefaultResponses(responses: Record<number, ResponseRef>): VersionBuilder {
    Object.assign(contract.defaultResponses, responses);
    return builder;
  }

  const builder: VersionBuilder = {
    contract,
    defineResource: defineVersionResource,
    addResource,
    addProperties,
    components: {
      defineSchemas: defineVersionSchemas,
      defineParameters: defineVersionParameters,
      defineRequestBodies: defineVersionRequestBodies,
      defineResponses: defineVersionResponses,
    },
    setDefaultResponses,
  };

  return builder;
}
