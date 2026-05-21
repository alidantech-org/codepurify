import { EngineIdPart, createEngineId } from "../ids/engine-id.js";
import { RefKind } from "../refs/ref-kind.js";
import type { ModelRef, PropertyRef } from "../refs/ref.types.js";
import { withRefMethods } from "../refs/ref-methods.js";
import type { OptionalResourceContext } from "../resource/resource-context.types.js";
import { isHiddenByDefault } from "../schema/schema-access.js";
import { QueryBehavior } from "../schema/query-behavior.js";
import type { SchemaFieldMap } from "../schema/schema.types.js";
import { SdkKind, SdkPlacement } from "../sdk/sdk-extension.types.js";
import { PropertyKind } from "./property-kind.js";
import type {
  EntityFields,
  EntityPropertyRefs,
  NamedEntityPropertyRegistry,
  NamedPropertyRefRegistry,
  PropertyDefinition,
  PropertyRegistry,
  PropertyRefGroup,
} from "./property.types.js";

export interface DefinePropertiesOptions extends OptionalResourceContext {
  name: string;
}

export function defineProperties(options: DefinePropertiesOptions) {
  const definitions: PropertyDefinition[] = [];
  const refs: PropertyRegistry["ref"] = {};

  function shared<TName extends string>(
    name: TName,
    fields: SchemaFieldMap,
  ): NamedPropertyRefRegistry<TName> {
    definitions.push({ kind: PropertyKind.shared, name, fields });
    refs[name] = createPropertyRefs(options, name, fields);
    return registry() as NamedPropertyRefRegistry<TName>;
  }

  function forRef<TName extends string>(
    name: TName,
    fields: SchemaFieldMap,
  ): NamedPropertyRefRegistry<TName> {
    definitions.push({ kind: PropertyKind.forRef, name, fields });
    refs[name] = createPropertyRefs(options, name, fields);
    return registry() as NamedPropertyRefRegistry<TName>;
  }

  function entity<TEntity, TName extends string>(
    name: TName,
    fields: EntityFields<TEntity>,
  ): NamedEntityPropertyRegistry<TName> {
    definitions.push({ kind: PropertyKind.entity, name, fields });
    refs[name] = createEntityRefs(options, name, fields as SchemaFieldMap);
    return registry() as NamedEntityPropertyRegistry<TName>;
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
): PropertyRefGroup {
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
    model: createModelRef(options, name, "model", fieldRefs, fields),
    publicModel: createModelRef(
      options,
      name,
      "public-model",
      filterPublicFields(fields, fieldRefs),
      fields,
    ),
    selectedModel: createModelRef(
      options,
      name,
      "selected-model",
      filterSelectedFields(fields, fieldRefs),
      fields,
    ),
    partialModel: createModelRef(
      options,
      name,
      "partial-model",
      makeOptionalFields(fieldRefs),
      fields,
    ),
    query: createQueryRefs(options, name, fields, fieldRefs),
  };
}

function createPropertyRef(
  options: DefinePropertiesOptions,
  name: string,
  key: string,
): PropertyRefGroup[string] {
  const refId = createScopedId(options, EngineIdPart.property, name, key);

  return withRefMethods({
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
  });
}

function createModelRef(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: string,
  fields: PropertyRefGroup,
  sourceFields?: SchemaFieldMap,
): ModelRef {
  const refId = createScopedId(options, EngineIdPart.model, name, modelKey);

  return {
    id: refId,
    name: `${name}.${modelKey}`,
    kind: RefKind.model,
    modelKey,
    fields,
    sourceFields,
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

function hasBehaviorOptions(value: unknown): value is {
  access?: Parameters<typeof isHiddenByDefault>[0];
  select?: boolean;
} {
  return !!value && typeof value === "object" && "kind" in value;
}

function filterPublicFields(
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasBehaviorOptions(field)) return true;
      return !isHiddenByDefault("access" in field ? field.access : undefined);
    }),
  );
}

function filterSelectedFields(
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasBehaviorOptions(field)) return true;
      if (field.select !== undefined) return field.select;
      return !isHiddenByDefault(field.access);
    }),
  );
}

function makeOptionalFields(refs: PropertyRefGroup): PropertyRefGroup {
  return refs;
}

function createQueryRefs(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): EntityPropertyRefs["query"] {
  const query = {
    exact: createQueryModel(
      options,
      name,
      "query-exact",
      fields,
      refs,
      QueryBehavior.exact,
    ),
    search: createQueryModel(
      options,
      name,
      "query-search",
      fields,
      refs,
      QueryBehavior.search,
    ),
    exactSearch: createQueryModel(
      options,
      name,
      "query-exact-search",
      fields,
      refs,
      QueryBehavior.exactSearch,
    ),
    range: createQueryModel(
      options,
      name,
      "query-range",
      fields,
      refs,
      QueryBehavior.range,
    ),
    in: createQueryModel(
      options,
      name,
      "query-in",
      fields,
      refs,
      QueryBehavior.in,
    ),
    exists: createQueryModel(
      options,
      name,
      "query-exists",
      fields,
      refs,
      QueryBehavior.exists,
    ),
    sort: createSortModel(options, name, fields, refs),
  };

  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => Object.keys(value.fields).length > 0,
    ),
  );
}

function createQueryModel(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
  behavior: QueryBehavior,
): ModelRef {
  return createModelRef(
    options,
    name,
    modelKey,
    Object.fromEntries(
      Object.entries(refs).filter(([key]) => {
        const field = fields[key];
        return (
          hasBehaviorOptions(field) &&
          "query" in field &&
          !!field.query &&
          field.query.methods?.includes(behavior)
        );
      }),
    ),
    fields,
  );
}

function createSortModel(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): ModelRef {
  return createModelRef(
    options,
    name,
    "query-sort",
    Object.fromEntries(
      Object.entries(refs).filter(([key]) => {
        const field = fields[key];
        return (
          hasBehaviorOptions(field) &&
          "query" in field &&
          !!field.query &&
          field.query.sort === true
        );
      }),
    ),
    fields,
  );
}
