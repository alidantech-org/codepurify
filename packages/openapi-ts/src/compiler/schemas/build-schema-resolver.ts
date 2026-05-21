import type { ComponentRegistry } from "../../components/component.types.js";
import {
  componentRefToSchemaName,
  modelRefToSchemaName,
} from "../../naming/ref-schema-name";
import type {
  EntityPropertyRefs,
  PropertyRegistry,
  PropertyRegistryRef,
} from "../../properties/property.types.js";
import type { ResourceBuilder } from "../../resource/define-resource";
import type { RefResolver } from "../refs/ref-resolver.types.js";
import { toSchemaName } from "../../naming/schema-name";
import { PropertyRef } from "@/package/refs/ref.types.js";

export function buildSchemaResolver(
  resources: readonly ResourceBuilder[],
  properties: readonly PropertyRegistry[],
  components: readonly ComponentRegistry[],
): RefResolver {
  const schemas = new Map<string, string>();

  for (const registry of properties) {
    registerPropertyRegistry(registry, schemas);
  }

  for (const registry of components) {
    registerComponentRegistry(registry, schemas);
  }

  for (const resource of resources) {
    for (const registry of resource.properties) {
      registerPropertyRegistry(registry, schemas);
    }

    for (const registry of resource.components) {
      registerComponentRegistry(registry, schemas);
    }
  }

  return { schemas };
}

function registerComponentRegistry(
  registry: ComponentRegistry,
  schemas: Map<string, string>,
): void {
  for (const [key, ref] of Object.entries(registry.ref)) {
    schemas.set(ref.id, componentRefToSchemaName(ref));
  }
}

function registerPropertyRegistry(
  registry: PropertyRegistry,
  schemas: Map<string, string>,
): void {
  for (const [groupName, value] of Object.entries(registry.ref)) {
    registerPropertyRegistryRef(groupName, value, schemas);
  }
}

function registerPropertyRegistryRef(
  groupName: string,
  value: PropertyRegistryRef,
  schemas: Map<string, string>,
): void {
  if (isEntityRefs(value)) {
    for (const [key, ref] of Object.entries(value.fields)) {
      schemas.set(ref.id, toSchemaName(groupName, key));
    }

    schemas.set(value.model.id, modelRefToSchemaName(value.model));
    schemas.set(value.publicModel.id, modelRefToSchemaName(value.publicModel));
    schemas.set(
      value.partialModel.id,
      modelRefToSchemaName(value.partialModel),
    );
    return;
  }

  if (isPropertyRefGroup(value)) {
    for (const [key, ref] of Object.entries(value)) {
      schemas.set(ref.id, toSchemaName(groupName, key));
    }
  }
}

function isEntityRefs(value: PropertyRegistryRef): value is EntityPropertyRefs {
  return (
    !!value &&
    typeof value === "object" &&
    "fields" in value &&
    "model" in value &&
    "publicModel" in value
  );
}

function isPropertyRefGroup(
  value: PropertyRegistryRef,
): value is Record<string, PropertyRef> {
  return !!value && typeof value === "object";
}
