import { defineResource } from '../resource/define-resource';
import type { DefineResourceOptions, ResourceBuilder } from '../resource/define-resource';
import type { RouteResponseInput } from '../routes/route.types';
import type { PropertyRegistry } from '../properties/property.types';
import type { VersionContract, VersionInfo, VersionDefaults } from './version-contract.types';
import { ContentType } from '@/app/runtime/output/output.constants';

import { defineSchemas } from '@/contract/schema/schemas/define-schemas';
import { SchemaComponentRegistry, SchemaComponentValue } from '@/contract/schema/schemas/schema-component.types';
import { defineParameters } from '../schema/parameters/define-parameters';
import { ParameterComponentRegistry, ParameterComponentDefinition } from '../schema/parameters/parameter-component.types';
import { defineRequestBodies } from '../schema/request-bodies/define-request-bodies';
import { RequestBodyComponentRegistry, RequestBodyComponentDefinition } from '../schema/request-bodies/request-body-component.types';
import { defineResponses } from '../schema/responses/define-responses';
import { ResponseComponentRegistry, ResponseComponentDefinition } from '../schema/responses/response-component.types';

export interface DefineVersionContractOptions {
  info: VersionInfo;
  defaults?: VersionDefaults;
  resources?: ResourceBuilder[];
  properties?: PropertyRegistry[];
  schemaComponents?: SchemaComponentRegistry[];
  parameterComponents?: ParameterComponentRegistry[];
  requestBodyComponents?: RequestBodyComponentRegistry[];
  responseComponents?: ResponseComponentRegistry[];
  defaultResponses?: Record<number, RouteResponseInput>;
}

export interface VersionBuilder {
  readonly contract: VersionContract;
  defineResource(options: DefineResourceOptions): ResourceBuilder;
  addResource(resource: ResourceBuilder): VersionBuilder;
  addProperties(properties: PropertyRegistry): VersionBuilder;
  defineSchemas<TInput extends Record<string, SchemaComponentValue>>(
    input: TInput,
    name?: string,
  ): ReturnType<typeof defineSchemas<TInput>>;
  setDefaultResponses(responses: Record<number, RouteResponseInput>): VersionBuilder;
}

export function defineVersionContract(options: DefineVersionContractOptions): VersionBuilder {
  const contract: VersionContract = {
    info: options.info,
    defaults: {
      requestContentType: options.defaults?.requestContentType ?? ContentType.json,
      responseContentType: options.defaults?.responseContentType ?? ContentType.json,
    },
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

  function defineVersionSchemas<TInput extends Record<string, SchemaComponentValue>>(input: TInput, name?: string) {
    const registry = defineSchemas(
      {
        name: name ?? 'shared',
      },
      input,
    );

    schemaComponents.push(registry);
    return registry;
  }

  function defineVersionParameters<TInput extends Record<string, Omit<ParameterComponentDefinition, 'key'>>>(input: TInput, name?: string) {
    const registry = defineParameters(
      {
        name: name ?? 'shared',
      },
      input,
    );

    parameterComponents.push(registry);
    return registry;
  }

  function defineVersionRequestBodies<TInput extends Record<string, Omit<RequestBodyComponentDefinition, 'name'>>>(
    input: TInput,
    name?: string,
  ) {
    const registry = defineRequestBodies(
      {
        name: name ?? 'shared',
      },
      input,
    );

    requestBodyComponents.push(registry);
    return registry;
  }

  function defineVersionResponses<TInput extends Record<string, Omit<ResponseComponentDefinition, 'name'>>>(input: TInput, name?: string) {
    const registry = defineResponses(
      {
        name: name ?? 'shared',
      },
      input,
    );

    responseComponents.push(registry);
    return registry;
  }

  function setDefaultResponses(responses: Record<number, RouteResponseInput>): VersionBuilder {
    Object.assign(contract.defaultResponses, responses);
    return builder;
  }

  const builder: VersionBuilder = {
    contract,
    defineResource: defineVersionResource,
    addResource,
    addProperties,
    defineSchemas: defineVersionSchemas,
    setDefaultResponses,
  };

  return builder;
}
