import { defineResource } from "../resource/define-resource.js";
import type {
  DefineResourceOptions,
  ResourceBuilder,
} from "../resource/define-resource.js";
import type { ComponentRegistry } from "../components/component.types.js";
import type { PropertyRegistry } from "../properties/property.types.js";
import type { VersionContract, VersionInfo } from "./version-contract.types.js";

export interface DefineVersionContractOptions {
  info: VersionInfo;
  resources?: ResourceBuilder[];
  properties?: PropertyRegistry[];
  components?: ComponentRegistry[];
}

export interface VersionBuilder {
  readonly contract: VersionContract;
  defineResource(options: DefineResourceOptions): ResourceBuilder;
  addResource(resource: ResourceBuilder): VersionBuilder;
  addProperties(properties: PropertyRegistry): VersionBuilder;
  addComponents(components: ComponentRegistry): VersionBuilder;
}

export function defineVersionContract(
  options: DefineVersionContractOptions,
): VersionBuilder {
  const contract: VersionContract = {
    info: options.info,
    resources: [...(options.resources ?? [])],
    properties: [...(options.properties ?? [])],
    components: [...(options.components ?? [])],
  };

  function defineVersionResource(
    resourceOptions: DefineResourceOptions,
  ): ResourceBuilder {
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

  function addComponents(components: ComponentRegistry): VersionBuilder {
    contract.components.push(components);
    return builder;
  }

  const builder: VersionBuilder = {
    contract,
    defineResource: defineVersionResource,
    addResource,
    addProperties,
    addComponents,
  };

  return builder;
}
