import { EngineIdPart, createEngineId } from '../ids/engine-id.js';
import { RefKind } from '../refs/ref-kind.js';
import type { ModelRef, PropertyRef } from '../refs/ref.types.js';
import { withRefMethods } from '../refs/ref-methods.js';
import type { RefWithUsageMethods } from '../refs/ref-usage.types.js';
import type { OptionalResourceContext } from '../resource/resource-context.types.js';
import { isHiddenByDefault } from '../schema/schema-access.js';
import { QueryBehavior } from '../schema/query-behavior.js';
import type { PropertyDefinitionFieldMap, SchemaFieldMap, SchemaField } from '../schema/schema.types.js';
import { SdkKind, SdkPlacement } from '../sdk/sdk-extension.types.js';
import { toSchemaName } from '../naming/schema-name.js';
import { isRefUsage } from '../validation/ref-usage-guards.js';
import { PropertyKind } from './property-kind.js';
import type {
  EntityOptions,
  EntityPropertyRefs,
  EntityPropertyRefsV2,
  EntityRegistryResult,
  EntityLocalFields,
  EntityFieldRefs,
  EntityInheritanceInput,
  ExtractInheritedFields,
  NoExtraEntityKeys,
  NamedEntityPropertyRegistry,
  PropertyDefinition,
  PropertyGroupOptions,
  PropertyGroupRegistry,
  PropertyRegistry,
  PropertyRefGroup,
  PropertyFieldRefMap,
  EntityExtensionMap,
  MergePropertyRefGroups,
  PropertyRefsFromFields,
} from './property.types.js';
import { compileZodRef } from '../zod/compile-zod-ref.js';
import type { z } from 'zod';

export interface DefinePropertiesOptions extends OptionalResourceContext {
  name: string;
}

export function defineProperties(options: DefinePropertiesOptions) {
  const definitions: PropertyDefinition[] = [];
  const refs: PropertyRegistry['ref'] = {};

  // Create toZod callback if zodRegistry is available
  const toZod = options.zodRegistry
    ? (ref: unknown): z.ZodTypeAny => compileZodRef(ref as PropertyRef | ModelRef, options.zodRegistry!)
    : undefined;

  function shared<TName extends string, TFields extends PropertyDefinitionFieldMap>(
    name: TName,
    fields: TFields,
    groupOptions: PropertyGroupOptions = {},
  ): PropertyGroupRegistry<PropertyFieldRefMap<TFields>> {
    definitions.push({
      kind: PropertyKind.shared,
      name,
      fields,
      emitSchema: groupOptions.emitSchema,
      abstract: groupOptions.abstract,
    });

    const groupRefs = createPropertyRefs(options, name, fields, PropertyKind.shared, toZod) as PropertyFieldRefMap<TFields>;

    refs[name] = groupRefs;

    return {
      name: options.name,
      definitions,
      ref: groupRefs,
    } as PropertyGroupRegistry<PropertyFieldRefMap<TFields>>;
  }

  function forRef<TName extends string, TFields extends PropertyDefinitionFieldMap>(
    name: TName,
    fields: TFields,
    groupOptions: PropertyGroupOptions = {},
  ): PropertyGroupRegistry<PropertyFieldRefMap<TFields>> {
    definitions.push({
      kind: PropertyKind.forRef,
      name,
      fields,
      emitSchema: groupOptions.emitSchema,
      abstract: groupOptions.abstract,
    });

    const groupRefs = createPropertyRefs(options, name, fields, PropertyKind.forRef, toZod) as PropertyFieldRefMap<TFields>;

    refs[name] = groupRefs;

    return {
      name: options.name,
      definitions,
      ref: groupRefs,
    } as PropertyGroupRegistry<PropertyFieldRefMap<TFields>>;
  }

  function entity<
    const TName extends string = string,
    const TFields extends EntityLocalFields = EntityLocalFields,
    TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
  >(
    name: TName,
    fields: TFields,
    entityOptions: EntityOptions<TExtends> = {},
  ): EntityRegistryResult<TName, TFields, ExtractInheritedFields<TExtends>> {
    return createEntityRegistry(name, fields, entityOptions);
  }

  function entityFor<TEntity>() {
    return <
      const TName extends string = string,
      const TFields extends EntityLocalFields = EntityLocalFields,
      TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
    >(
      name: TName,
      fields: NoExtraEntityKeys<TEntity, TFields>,
      entityOptions: EntityOptions<TExtends> = {},
    ): EntityRegistryResult<TName, TFields, ExtractInheritedFields<TExtends>> => {
      return createEntityRegistry(name, fields, entityOptions);
    };
  }

  function createEntityRegistry<
    const TName extends string = string,
    const TFields extends EntityLocalFields = EntityLocalFields,
    TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
  >(
    name: TName,
    fields: TFields,
    entityOptions: EntityOptions<TExtends>,
  ): EntityRegistryResult<TName, TFields, ExtractInheritedFields<TExtends>> {
    const mergedFields = mergeInheritedFields(entityOptions.extends, fields as unknown as Record<string, SchemaField>) as TFields &
      ExtractInheritedFields<TExtends>;

    const entityRefs = createEntityRefsV2(options, name, mergedFields, entityOptions.abstract === true, toZod);

    definitions.push({
      kind: PropertyKind.entity,
      name,
      fields: mergedFields as unknown as Record<string, SchemaField>,
      extends: entityOptions.extends
        ? [entityOptions.extends as unknown as NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>]
        : undefined,
      abstract: entityOptions.abstract,
      refs: entityRefs,
    });

    refs[name] = entityRefs as unknown as EntityPropertyRefs;

    return {
      ...registry(),
      ref: entityRefs as unknown as EntityPropertyRefsV2<TFields & ExtractInheritedFields<TExtends>>,
      namedRef: {
        [name]: entityRefs,
      } as Record<TName, EntityPropertyRefsV2<TFields & ExtractInheritedFields<TExtends>>>,
    };
  }

  function registry(): PropertyRegistry {
    return {
      name: options.name,
      definitions,
      ref: refs,
    };
  }

  return { shared, entity, entityFor, forRef, registry };
}

function createPropertyRefs(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  sourceKind: PropertyKind,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [key, createPropertyRef(options, name, key, sourceKind, field, toZod)]),
  );
}

function createPropertyRef(
  options: DefinePropertiesOptions,
  name: string,
  key: string,
  sourceKind: PropertyKind,
  field: unknown,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): PropertyRefGroup[string] {
  const refId = createScopedId(options, EngineIdPart.property, name, key);
  const isShared = sourceKind === PropertyKind.shared;

  // Register source field in zodRegistry if available
  if (options.zodRegistry && typeof field === 'object' && field !== null && 'kind' in field) {
    options.zodRegistry.fields.set(refId, field as SchemaField);
  }

  return withRefMethods(
    {
      id: refId,
      name: key,
      kind: RefKind.property,
      propertyKey: key,
      targetRefId: getTargetRefId(field),
      meta: {
        kind: SdkKind.primitive,
        placement: isShared ? SdkPlacement.globalShared : getPlacement(options),
        group: isShared ? 'shared' : options.resource?.group,
        resource: options.resource?.key,
        property: key,
        refId,
        shared: isShared,
        skip: true,
      },
    },
    { toZod },
  );
}

function createModelRef(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: string,
  fields: PropertyRefGroup,
  sourceFields?: SchemaFieldMap,
  inherited?: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
  isAbstract = false,
): ModelRef {
  const refId = createScopedId(options, EngineIdPart.model, name, modelKey);

  const modelRef = {
    id: refId,
    name: `${name}.${modelKey}`,
    kind: RefKind.model,
    modelKey,
    fields,
    sourceFields,
    openapiRef: `#/components/schemas/${getModelSchemaName(name, modelKey, isAbstract)}`,
    inherits: createInheritanceMeta(inherited),
    abstract: isAbstract,
    meta: {
      kind: SdkKind.model,
      placement: getPlacement(options),
      group: options.resource?.group,
      resource: options.resource?.key,
      refId,
    },
  };

  // Register model ref in zodRegistry if available
  if (options.zodRegistry) {
    options.zodRegistry.models.set(refId, modelRef);
  }

  return modelRef;
}

function getModelSchemaName(name: string, modelKey: string, isAbstract: boolean): string {
  if (isAbstract) return toSchemaName(`${name}AbstractModel`);
  if (modelKey === 'model') return toSchemaName(`${name}Model`);
  if (modelKey === 'public-model') return toSchemaName(`${name}PublicModel`);
  if (modelKey === 'partial-model') return toSchemaName(`${name}PartialModel`);
  if (modelKey === 'selected-model') return toSchemaName(`${name}SelectedModel`);

  if (modelKey === 'query-exact') return toSchemaName(`${name}QueryExact`);
  if (modelKey === 'query-search') return toSchemaName(`${name}QuerySearch`);
  if (modelKey === 'query-exact-search') return toSchemaName(`${name}QueryExactSearch`);
  if (modelKey === 'query-range') return toSchemaName(`${name}QueryRange`);
  if (modelKey === 'query-in') return toSchemaName(`${name}QueryIn`);
  if (modelKey === 'query-exists') return toSchemaName(`${name}QueryExists`);
  if (modelKey === 'query-sort') return toSchemaName(`${name}QuerySort`);

  return toSchemaName(`${name}${toSchemaName(modelKey)}Model`);
}

function createScopedId(options: DefinePropertiesOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);

  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefinePropertiesOptions): SdkPlacement {
  return options.resource ? SdkPlacement.resourceLocal : SdkPlacement.globalShared;
}

function hasBehaviorOptions(value: unknown): value is {
  access?: Parameters<typeof isHiddenByDefault>[0];
  select?: boolean;
} {
  return !!value && typeof value === 'object' && 'kind' in value;
}

function filterPublicFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasBehaviorOptions(field)) return true;
      return !isHiddenByDefault('access' in field ? field.access : undefined);
    }),
  );
}

function filterSelectedFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
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
): EntityPropertyRefs['query'] {
  const query = {
    exact: createQueryModel(options, name, 'query-exact', fields, refs, QueryBehavior.exact),
    search: createQueryModel(options, name, 'query-search', fields, refs, QueryBehavior.search),
    exactSearch: createQueryModel(options, name, 'query-exact-search', fields, refs, QueryBehavior.exactSearch),
    range: createQueryModel(options, name, 'query-range', fields, refs, QueryBehavior.range),
    in: createQueryModel(options, name, 'query-in', fields, refs, QueryBehavior.in),
    exists: createQueryModel(options, name, 'query-exists', fields, refs, QueryBehavior.exists),
    sort: createSortModel(options, name, fields, refs),
  };

  return query;
}

function createQueryModel(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
  behavior: QueryBehavior,
): RefWithUsageMethods<ModelRef> {
  return withRefMethods(
    createModelRef(
      options,
      name,
      modelKey,
      Object.fromEntries(
        Object.entries(refs).filter(([key]) => {
          const field = fields[key];
          return hasBehaviorOptions(field) && 'query' in field && !!field.query && field.query.methods?.includes(behavior);
        }),
      ),
      fields,
    ),
  );
}

function createSortModel(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): RefWithUsageMethods<ModelRef> {
  return withRefMethods(
    createModelRef(
      options,
      name,
      'query-sort',
      Object.fromEntries(
        Object.entries(refs).filter(([key]) => {
          const field = fields[key];
          return hasBehaviorOptions(field) && 'query' in field && !!field.query && field.query.sort === true;
        }),
      ),
      fields,
    ),
  );
}

function isEntityRegistry(value: unknown): value is NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap> {
  return typeof value === 'object' && value !== null && 'name' in value && 'ref' in value && 'allFields' in value;
}

function normalizeExtends(
  value: NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap> | undefined,
): NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[] {
  if (!value) return [];

  if (isEntityRegistry(value)) {
    return [value];
  }

  throw new Error('Invalid entity inheritance source. Use the entity object returned by .entity(...), e.g. extends: baseEntity.');
}

function getInheritanceFields(
  source: NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>,
): PropertyDefinitionFieldMap {
  return source.allFields;
}

function mergeInheritedPropertyGroups(
  sources: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
): SchemaFieldMap {
  const merged: SchemaFieldMap = {};

  for (const source of sources) {
    const fields = getInheritanceFields(source);

    for (const [key, field] of Object.entries(fields)) {
      // Directly copy inherited fields without wrapping in schema.ref()
      merged[key] = field as SchemaFieldMap[string];
    }
  }

  return merged;
}

function createEntityRefs(
  options: DefinePropertiesOptions,
  name: string,
  mergedFields: SchemaFieldMap,
  ownFields: SchemaFieldMap,
  inheritedSources: NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
  isAbstract = false,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): EntityPropertyRefs {
  const fieldRefs = createPropertyRefs(options, name, mergedFields, PropertyKind.entity, toZod);

  return {
    name,
    fields: fieldRefs,
    abstract: isAbstract,
    schemaRef: `#/components/schemas/${toSchemaName(name)}`,
    model: withRefMethods(
      createModelRef(options, name, isAbstract ? 'abstract-model' : 'model', fieldRefs, mergedFields, inheritedSources, isAbstract),
    ),
    publicModel: withRefMethods(
      createModelRef(options, name, 'public-model', filterPublicFields(mergedFields, fieldRefs), mergedFields, inheritedSources),
    ),
    selectedModel: withRefMethods(
      createModelRef(options, name, 'selected-model', filterSelectedFields(mergedFields, fieldRefs), mergedFields, inheritedSources),
    ),
    partialModel: withRefMethods(createModelRef(options, name, 'partial-model', fieldRefs, mergedFields, inheritedSources)),
    query: createQueryRefs(options, name, mergedFields, fieldRefs),
  };
}

function mergeInheritedFields(
  inherited: EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined,
  fields: Record<string, SchemaField>,
): Record<string, SchemaField> {
  return {
    ...collectInheritedFields(inherited),
    ...fields,
  };
}

function collectInheritedFields(
  inherited: EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined,
): Record<string, SchemaField> {
  if (!inherited) return {};

  if (Array.isArray(inherited)) {
    return inherited.reduce<Record<string, SchemaField>>((acc, item) => ({ ...acc, ...collectInheritedFields(item) }), {});
  }

  if ('ref' in inherited && 'sourceFields' in inherited.ref.model) {
    return inherited.ref.model.sourceFields ?? {};
  }

  if ('model' in inherited && 'sourceFields' in inherited.model) {
    return inherited.model.sourceFields ?? {};
  }

  return {};
}

function createEntityRefsV2<TFields extends Record<string, SchemaField>>(
  options: DefinePropertiesOptions,
  name: string,
  fields: TFields,
  isAbstract = false,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): EntityPropertyRefsV2<TFields> {
  const fieldRefs = createPropertyRefs(options, name, fields as SchemaFieldMap, PropertyKind.entity, toZod);

  return {
    fields: fieldRefs as unknown as EntityFieldRefs<TFields>,
    abstract: isAbstract,
    schemaRef: `#/components/schemas/${toSchemaName(name)}`,
    model: withRefMethods(
      createModelRef(options, name, isAbstract ? 'abstract-model' : 'model', fieldRefs, fields as SchemaFieldMap, undefined, isAbstract),
      { toZod },
    ),
    publicModel: withRefMethods(
      createModelRef(
        options,
        name,
        'public-model',
        filterPublicFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        undefined,
      ),
      { toZod },
    ),
    selectedModel: withRefMethods(
      createModelRef(
        options,
        name,
        'selected-model',
        filterSelectedFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        undefined,
      ),
      { toZod },
    ),
    partialModel: withRefMethods(createModelRef(options, name, 'partial-model', fieldRefs, fields as SchemaFieldMap, undefined), { toZod }),
    query: createQueryRefs(options, name, fields as SchemaFieldMap, fieldRefs),
  };
}

function createInheritanceMeta(
  inherited: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[] | undefined,
): ModelRef['inherits'] {
  if (!inherited || inherited.length === 0) return undefined;

  return inherited.map((source) => {
    if (isEntityRegistry(source)) {
      return {
        ref: source.ref.schemaRef ?? `#/components/schemas/${toSchemaName(source.name)}`,
        fields: Object.keys(source.allFields),
      };
    }

    throw new Error('Invalid entity inheritance source in createInheritanceMeta');
  });
}

function inferGroupNameFromRefId(refId: string | undefined): string {
  if (!refId) return 'UnknownInheritedFields';

  const parts = refId.split(':');
  const propertyIndex = parts.indexOf('property');

  return propertyIndex >= 0 ? (parts[propertyIndex + 1] ?? 'UnknownInheritedFields') : 'UnknownInheritedFields';
}

function getTargetRefId(field: unknown): string | undefined {
  if (isPropertyRef(field)) return field.targetRefId ?? field.id;
  if (isRefUsage(field) && isPropertyRef(field.ref)) return field.ref.targetRefId ?? field.ref.id;
  return undefined;
}

function isPropertyRef(value: unknown): value is PropertyRef {
  return !!value && typeof value === 'object' && 'kind' in value && value.kind === RefKind.property && 'propertyKey' in value;
}

function isPropertyRefGroup(value: unknown): value is PropertyRefGroup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (isPropertyRef(value)) return false;
  if (isEntityPropertyRefs(value)) return false;

  return Object.values(value).every(isPropertyRef);
}

function isEntityPropertyRefs(value: unknown): value is EntityPropertyRefs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const candidate = value as Partial<EntityPropertyRefs>;

  return (
    !!candidate.fields &&
    typeof candidate.fields === 'object' &&
    !!candidate.model &&
    !!candidate.publicModel &&
    !!candidate.selectedModel &&
    !!candidate.partialModel &&
    !!candidate.query
  );
}
