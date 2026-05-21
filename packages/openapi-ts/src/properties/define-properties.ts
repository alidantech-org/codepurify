import { EngineIdPart, createEngineId } from "../ids/engine-id.js";
import { RefKind } from "../refs/ref-kind.js";
import type { ModelRef, PropertyRef } from "../refs/ref.types.js";
import type { OptionalResourceContext } from "../resource/resource-context.types.js";
import type { SchemaFieldMap } from "../schema/schema.types.js";
import { SdkKind, SdkPlacement } from "../sdk/sdk-extension.types.js";
import { PropertyKind } from "./property-kind.js";
import type {
  EntityFields,
  EntityPropertyRefs,
  PropertyDefinition,
  PropertyRegistry,
} from "./property.types.js";

export interface DefinePropertiesOptions extends OptionalResourceContext {
  name: string;
}

export function defineProperties(options: DefinePropertiesOptions) {
  const definitions: PropertyDefinition[] = [];
  const refs: PropertyRegistry["ref"] = {};

  function shared(name: string, fields: SchemaFieldMap): PropertyRegistry {
    definitions.push({ kind: PropertyKind.shared, name, fields });
    refs[name] = createPropertyRefs(options, name, fields);
    return registry();
  }

  function forRef(name: string, fields: SchemaFieldMap): PropertyRegistry {
    definitions.push({ kind: PropertyKind.forRef, name, fields });
    refs[name] = createPropertyRefs(options, name, fields);
    return registry();
  }

  function entity<TEntity>(
    name: string,
    fields: EntityFields<TEntity>,
  ): PropertyRegistry {
    definitions.push({ kind: PropertyKind.entity, name, fields });
    refs[name] = createEntityRefs(options, name, fields as SchemaFieldMap);
    return registry();
  }

  function registry(): PropertyRegistry {
    return {
      name: options.name,
      definitions,
      ref: refs,
    };
  }

  return { shared, entity, forRef, registry };
}

function createPropertyRefs(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
): Record<string, PropertyRef> {
  return Object.fromEntries(
    Object.keys(fields).map((key) => [
      key,
      createPropertyRef(options, name, key),
    ]),
  );
}

function createEntityRefs(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
): EntityPropertyRefs {
  const fieldRefs = createPropertyRefs(options, name, fields);

  return {
    fields: fieldRefs,
    model: createModelRef(options, name, "model", fieldRefs),
    publicModel: createModelRef(options, name, "public-model", fieldRefs),
    partialModel: createModelRef(options, name, "partial-model", fieldRefs),
  };
}

function createPropertyRef(
  options: DefinePropertiesOptions,
  name: string,
  key: string,
): PropertyRef {
  const refId = createScopedId(options, EngineIdPart.property, name, key);

  return {
    id: refId,
    name: key,
    kind: RefKind.property,
    propertyKey: key,
    meta: {
      kind: SdkKind.property,
      placement: getPlacement(options),
      group: options.resource?.group,
      resource: options.resource?.key,
      property: key,
      refId,
    },
  };
}

function createModelRef(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: string,
  fields: Record<string, PropertyRef>,
): ModelRef {
  const refId = createScopedId(options, EngineIdPart.model, name, modelKey);

  return {
    id: refId,
    name: `${name}.${modelKey}`,
    kind: RefKind.model,
    modelKey,
    fields,
    meta: {
      kind: SdkKind.model,
      placement: getPlacement(options),
      group: options.resource?.group,
      resource: options.resource?.key,
      refId,
    },
  };
}

function createScopedId(
  options: DefinePropertiesOptions,
  ...parts: string[]
): string {
  if (!options.resource) return createEngineId(...parts);

  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefinePropertiesOptions): SdkPlacement {
  return options.resource
    ? SdkPlacement.resourceLocal
    : SdkPlacement.globalShared;
}
