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
import type { ModelEmissionInput, DeepPartial } from '../config/model-emission-defaults.js';
import type { QueryModelOptions } from '../config/query-model-defaults.js';
import { resolveModelEmission } from '../config/resolve-model-emission.js';
import { resolveQueryModelOptions } from '../config/resolve-query-model-options.js';

export interface DefinePropertiesOptions extends OptionalResourceContext {
  name: string;
  modelEmission?: ModelEmissionInput;
  queryModels?: DeepPartial<QueryModelOptions>;
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

    const inheritedSources = entityOptions.extends
      ? normalizeExtends(entityOptions.extends as unknown as NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>)
      : undefined;

    const entityRefs = createEntityRefsV2(
      options,
      name,
      mergedFields,
      entityOptions.abstract === true,
      inheritedSources,
      toZod,
      entityOptions,
    );

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
    inherits: createInheritanceMeta(inherited, modelKey),
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

  if (modelKey === 'query-exact') return toSchemaName(`${name}QueryExact`);
  if (modelKey === 'query-search') return toSchemaName(`${name}QuerySearch`);
  if (modelKey === 'query-exact-search') return toSchemaName(`${name}QueryExactSearch`);
  if (modelKey === 'query-range') return toSchemaName(`${name}QueryRange`);
  if (modelKey === 'query-in') return toSchemaName(`${name}QueryIn`);
  if (modelKey === 'query-exists') return toSchemaName(`${name}QueryExists`);
  if (modelKey === 'query-sort') return toSchemaName(`${name}QuerySort`);
  if (modelKey === 'query-select') return toSchemaName(`${name}QuerySelect`);

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

function filterPrivateFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasBehaviorOptions(field)) return true;
      const access = 'access' in field ? field.access : undefined;
      // Include public and private fields, exclude internal/system/secret
      return access === 'public' || access === 'private' || access === undefined;
    }),
  );
}

function filterInternalFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasBehaviorOptions(field)) return true;
      const access = 'access' in field ? field.access : undefined;
      // Include public, private, and internal fields, exclude system/secret
      return access === 'public' || access === 'private' || access === 'internal' || access === undefined;
    }),
  );
}

function filterSystemFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasBehaviorOptions(field)) return true;
      const access = 'access' in field ? field.access : undefined;
      // Include public, private, internal, and system fields, exclude secret
      return access !== 'secret';
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
  inherited?: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
): EntityPropertyRefs['query'] {
  const query = {
    exact: createQueryModel(options, name, 'query-exact', fields, refs, QueryBehavior.exact, inherited),
    search: createQueryModel(options, name, 'query-search', fields, refs, QueryBehavior.search, inherited),
    exactSearch: createQueryModel(options, name, 'query-exact-search', fields, refs, QueryBehavior.exactSearch, inherited),
    range: createQueryModel(options, name, 'query-range', fields, refs, QueryBehavior.range, inherited),
    in: createQueryModel(options, name, 'query-in', fields, refs, QueryBehavior.in, inherited),
    exists: createQueryModel(options, name, 'query-exists', fields, refs, QueryBehavior.exists, inherited),
    sort: createSortModel(options, name, fields, refs, inherited),
    select: createQueryModel(options, name, 'query-select', fields, refs, QueryBehavior.select, inherited),
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
  inherited?: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
): RefWithUsageMethods<ModelRef> {
  // For select behavior, include all selectable fields (not just those with query.methods)
  if (behavior === QueryBehavior.select) {
    return withRefMethods(
      createModelRef(
        options,
        name,
        modelKey,
        Object.fromEntries(
          Object.entries(refs).filter(([key]) => {
            const field = fields[key];
            if (!hasBehaviorOptions(field)) return true;
            // Include fields that are selectable (not secret/internal/system unless configured)
            const access = 'access' in field ? field.access : undefined;
            return access !== 'secret' && access !== 'internal' && access !== 'system';
          }),
        ),
        fields,
        inherited,
      ),
    );
  }

  // For other behaviors, filter by query.methods
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
  inherited?: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
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
      inherited,
    ),
  );
}

function isEntityRegistry(value: unknown): value is NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const record = value as Record<string, unknown>;
  const ref = record.ref;

  if (!ref || typeof ref !== 'object' || Array.isArray(ref)) return false;

  const refRecord = ref as Record<string, unknown>;

  return (
    typeof refRecord.fields === 'object' && refRecord.fields !== null && typeof refRecord.model === 'object' && refRecord.model !== null
  );
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
  return source.ref.fields as unknown as PropertyDefinitionFieldMap;
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
    partialModel: withRefMethods(createModelRef(options, name, 'partial-model', fieldRefs, mergedFields, inheritedSources)),
    query: createQueryRefs(options, name, mergedFields, fieldRefs, inheritedSources),
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

function createEntityRefsV2<
  TFields extends Record<string, SchemaField>,
  TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
>(
  options: DefinePropertiesOptions,
  name: string,
  fields: TFields,
  isAbstract = false,
  inheritedSources?: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[],
  toZod?: (ref: unknown) => z.ZodTypeAny,
  entityOptions?: EntityOptions<TExtends>,
): EntityPropertyRefsV2<TFields> {
  const fieldRefs = createPropertyRefs(options, name, fields as SchemaFieldMap, PropertyKind.entity, toZod);

  // Resolve config with precedence: entity > version > defaults
  const modelEmission = resolveModelEmission(options.modelEmission, entityOptions?.emitModels);
  const queryModelOptions = resolveQueryModelOptions(options.queryModels, entityOptions?.queryModels);

  return {
    fields: fieldRefs as unknown as EntityFieldRefs<TFields>,
    abstract: isAbstract,
    schemaRef: `#/components/schemas/${toSchemaName(name)}`,
    model: withRefMethods(
      createModelRef(
        options,
        name,
        isAbstract ? 'abstract-model' : 'model',
        fieldRefs,
        fields as SchemaFieldMap,
        inheritedSources,
        isAbstract,
      ),
      { toZod },
    ),
    publicModel: withRefMethods(
      createModelRef(
        options,
        name,
        'public-model',
        filterPublicFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    privateModel: withRefMethods(
      createModelRef(
        options,
        name,
        'private-model',
        filterPrivateFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    internalModel: withRefMethods(
      createModelRef(
        options,
        name,
        'internal-model',
        filterInternalFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    systemModel: withRefMethods(
      createModelRef(
        options,
        name,
        'system-model',
        filterSystemFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    partialModel: withRefMethods(createModelRef(options, name, 'partial-model', fieldRefs, fields as SchemaFieldMap, inheritedSources), {
      toZod,
    }),
    publicPartialModel: withRefMethods(
      createModelRef(
        options,
        name,
        'public-partial-model',
        filterPublicFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    privatePartialModel: withRefMethods(
      createModelRef(
        options,
        name,
        'private-partial-model',
        filterPrivateFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    internalPartialModel: withRefMethods(
      createModelRef(
        options,
        name,
        'internal-partial-model',
        filterInternalFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    systemPartialModel: withRefMethods(
      createModelRef(
        options,
        name,
        'system-partial-model',
        filterSystemFields(fields as SchemaFieldMap, fieldRefs),
        fields as SchemaFieldMap,
        inheritedSources,
      ),
      { toZod },
    ),
    query: createQueryRefs(options, name, fields as SchemaFieldMap, fieldRefs, inheritedSources),
    modelEmission,
    queryModelOptions,
  };
}

function createInheritanceMeta(
  inherited: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[] | undefined,
  childModelKey: string,
): ModelRef['inherits'] {
  if (!inherited || inherited.length === 0) return undefined;

  const result = inherited.map((source) => {
    if (isEntityRegistry(source)) {
      const parentModelRef = selectInheritedModelRef(source, childModelKey);
      if (!parentModelRef) return undefined;
      return {
        modelRef: parentModelRef,
        fields: Object.keys(source.ref.fields),
      };
    }

    throw new Error('Invalid entity inheritance source in createInheritanceMeta');
  });

  // Filter out undefined entries (when parent variant doesn't exist)
  return result.filter((item): item is NonNullable<typeof item> => item !== undefined);
}

function selectInheritedModelRef(
  parent: NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>,
  childModelKey: string,
): ModelRef | undefined {
  // Check if parent is V2 with emission config
  const isV2 = 'modelEmission' in parent.ref && 'privateModel' in parent.ref;

  if (isV2) {
    const parentV2 = parent.ref as unknown as {
      model: RefWithUsageMethods<ModelRef>;
      publicModel: RefWithUsageMethods<ModelRef>;
      privateModel: RefWithUsageMethods<ModelRef>;
      internalModel: RefWithUsageMethods<ModelRef>;
      systemModel: RefWithUsageMethods<ModelRef>;
      selectedModel: RefWithUsageMethods<ModelRef>;
      partialModel: RefWithUsageMethods<ModelRef>;
      publicPartialModel: RefWithUsageMethods<ModelRef>;
      privatePartialModel: RefWithUsageMethods<ModelRef>;
      internalPartialModel: RefWithUsageMethods<ModelRef>;
      systemPartialModel: RefWithUsageMethods<ModelRef>;
      query: {
        exact: RefWithUsageMethods<ModelRef>;
        search: RefWithUsageMethods<ModelRef>;
        exactSearch: RefWithUsageMethods<ModelRef>;
        range: RefWithUsageMethods<ModelRef>;
        in: RefWithUsageMethods<ModelRef>;
        exists: RefWithUsageMethods<ModelRef>;
        sort: RefWithUsageMethods<ModelRef>;
        select: RefWithUsageMethods<ModelRef>;
      };
      modelEmission: {
        model: boolean;
        publicModel: boolean;
        privateModel: boolean;
        internalModel: boolean;
        systemModel: boolean;
        partialModel: boolean;
        publicPartialModel: boolean;
        privatePartialModel: boolean;
        internalPartialModel: boolean;
        systemPartialModel: boolean;
        query: {
          exact: boolean;
          search: boolean;
          exactSearch: boolean;
          range: boolean;
          in: boolean;
          exists: boolean;
          sort: boolean;
          select: boolean;
        };
      };
    };

    const emission = parentV2.modelEmission;

    // For abstract parents, prefer the matching variant if it exists
    if (parent.ref.abstract) {
      switch (childModelKey) {
        case 'model':
          return parentV2.model;
        case 'public-model':
          return parentV2.publicModel ?? parentV2.model;
        case 'private-model':
          return parentV2.privateModel ?? parentV2.model;
        case 'internal-model':
          return parentV2.internalModel ?? parentV2.model;
        case 'system-model':
          return parentV2.systemModel ?? parentV2.model;
        case 'partial-model':
          return parentV2.partialModel ?? parentV2.model;
        case 'public-partial-model':
          return parentV2.publicPartialModel ?? parentV2.partialModel ?? parentV2.model;
        case 'private-partial-model':
          return parentV2.privatePartialModel ?? parentV2.partialModel ?? parentV2.model;
        case 'internal-partial-model':
          return parentV2.internalPartialModel ?? parentV2.partialModel ?? parentV2.model;
        case 'system-partial-model':
          return parentV2.systemPartialModel ?? parentV2.partialModel ?? parentV2.model;
        case 'query-exact':
          return emission.query.exact ? parentV2.query.exact : undefined;
        case 'query-search':
          return emission.query.search ? parentV2.query.search : undefined;
        case 'query-exact-search':
          return emission.query.exactSearch ? parentV2.query.exactSearch : undefined;
        case 'query-range':
          return emission.query.range ? parentV2.query.range : undefined;
        case 'query-in':
          return emission.query.in ? parentV2.query.in : undefined;
        case 'query-exists':
          return emission.query.exists ? parentV2.query.exists : undefined;
        case 'query-sort':
          return emission.query.sort ? parentV2.query.sort : undefined;
        case 'query-select':
          return emission.query.select ? parentV2.query.select : undefined;
        default:
          return parentV2.model;
      }
    }

    // For non-abstract parents, match the variant with emission check
    switch (childModelKey) {
      case 'model':
        return emission.model ? parentV2.model : parentV2.model;
      case 'public-model':
        return emission.publicModel ? parentV2.publicModel : parentV2.model;
      case 'private-model':
        return emission.privateModel ? parentV2.privateModel : (parentV2.publicModel ?? parentV2.model);
      case 'internal-model':
        return emission.internalModel ? parentV2.internalModel : (parentV2.privateModel ?? parentV2.publicModel ?? parentV2.model);
      case 'system-model':
        return emission.systemModel ? parentV2.systemModel : (parentV2.internalModel ?? parentV2.privateModel ?? parentV2.model);
      case 'partial-model':
        return emission.partialModel ? parentV2.partialModel : parentV2.model;
      case 'public-partial-model':
        return emission.publicPartialModel
          ? parentV2.publicPartialModel
          : (parentV2.partialModel ?? parentV2.publicModel ?? parentV2.model);
      case 'private-partial-model':
        return emission.privatePartialModel
          ? parentV2.privatePartialModel
          : (parentV2.partialModel ?? parentV2.privateModel ?? parentV2.model);
      case 'internal-partial-model':
        return emission.internalPartialModel
          ? parentV2.internalPartialModel
          : (parentV2.partialModel ?? parentV2.internalModel ?? parentV2.model);
      case 'system-partial-model':
        return emission.systemPartialModel
          ? parentV2.systemPartialModel
          : (parentV2.partialModel ?? parentV2.systemModel ?? parentV2.model);
      case 'query-exact':
        return emission.query.exact ? parentV2.query.exact : undefined;
      case 'query-search':
        return emission.query.search ? parentV2.query.search : undefined;
      case 'query-exact-search':
        return emission.query.exactSearch ? parentV2.query.exactSearch : undefined;
      case 'query-range':
        return emission.query.range ? parentV2.query.range : undefined;
      case 'query-in':
        return emission.query.in ? parentV2.query.in : undefined;
      case 'query-exists':
        return emission.query.exists ? parentV2.query.exists : undefined;
      case 'query-sort':
        return emission.query.sort ? parentV2.query.sort : undefined;
      case 'query-select':
        return emission.query.select ? parentV2.query.select : undefined;
      default:
        return parentV2.model;
    }
  }

  // Legacy behavior for V1 refs
  // For abstract parents, use the abstract model for normal/public/selected variants
  if (parent.ref.abstract) {
    switch (childModelKey) {
      case 'model':
      case 'public-model':
      case 'selected-model':
        return parent.ref.model;
      case 'partial-model':
        return parent.ref.partialModel ?? parent.ref.model;
      default:
        return parent.ref.model;
    }
  }

  // For non-abstract parents, match the variant
  switch (childModelKey) {
    case 'model':
      return parent.ref.model;
    case 'public-model':
      return parent.ref.publicModel ?? parent.ref.model;
    case 'partial-model':
      return parent.ref.partialModel ?? parent.ref.model;
    default:
      return parent.ref.model;
  }
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
    !!candidate.partialModel &&
    !!candidate.query
  );
}
