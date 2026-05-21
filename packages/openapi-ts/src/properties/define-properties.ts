import { EngineIdPart, createEngineId } from '../ids/engine-id.js';
import { RefKind } from '../refs/ref-kind.js';
import type { ModelRef, PropertyRef } from '../refs/ref.types.js';
import { withRefMethods } from '../refs/ref-methods.js';
import type { OptionalResourceContext } from '../resource/resource-context.types.js';
import { isHiddenByDefault } from '../schema/schema-access.js';
import { QueryBehavior } from '../schema/query-behavior.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';
import { SdkKind, SdkPlacement } from '../sdk/sdk-extension.types.js';
import { OpenApiRefPattern } from '../openapi/ref-patterns.js';
import { toSchemaName } from '../naming/schema-name.js';
import { isRefUsage } from '../validation/ref-usage-guards.js';
import { PropertyKind } from './property-kind.js';
import type {
  EntityFields,
  EntityInheritanceInput,
  EntityOptions,
  EntityPropertyRefs,
  NamedEntityPropertyRegistry,
  NamedPropertyRefRegistry,
  PropertyDefinition,
  PropertyGroupOptions,
  PropertyRegistry,
  PropertyRefGroup,
  EntityFieldRefs,
  MergedEntityFieldRefs,
} from './property.types.js';

export interface DefinePropertiesOptions extends OptionalResourceContext {
  name: string;
}

export function defineProperties(options: DefinePropertiesOptions) {
  const definitions: PropertyDefinition[] = [];
  const refs: PropertyRegistry['ref'] = {};

  function shared<TName extends string>(
    name: TName,
    fields: SchemaFieldMap,
    groupOptions: PropertyGroupOptions = {},
  ): NamedPropertyRefRegistry<TName> {
    definitions.push({
      kind: PropertyKind.shared,
      name,
      fields,
      emitSchema: groupOptions.emitSchema,
      abstract: groupOptions.abstract,
    });
    refs[name] = createPropertyRefs(options, name, fields, PropertyKind.shared);
    return registry() as NamedPropertyRefRegistry<TName>;
  }

  function forRef<TName extends string>(
    name: TName,
    fields: SchemaFieldMap,
    groupOptions: PropertyGroupOptions = {},
  ): NamedPropertyRefRegistry<TName> {
    definitions.push({
      kind: PropertyKind.forRef,
      name,
      fields,
      emitSchema: groupOptions.emitSchema,
      abstract: groupOptions.abstract,
    });
    refs[name] = createPropertyRefs(options, name, fields, PropertyKind.forRef);
    return registry() as NamedPropertyRefRegistry<TName>;
  }

  function entity<
    TEntity,
    TName extends string = string,
    TFields extends EntityFields<TEntity> = EntityFields<TEntity>,
    TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined =
      | EntityInheritanceInput
      | readonly EntityInheritanceInput[]
      | undefined,
  >(
    name: TName,
    fields: TFields,
    entityOptions?: EntityOptions<TExtends>,
  ): NamedEntityPropertyRegistry<TName, MergedEntityFieldRefs<TExtends, EntityFieldRefs<TEntity, TFields>>> {
    const optionsArg = entityOptions ?? {};
    const inheritedSources = normalizeExtends(optionsArg.extends);
    const inheritedFields = mergeInheritedPropertyGroups(inheritedSources);

    const mergedFields: SchemaFieldMap = {
      ...inheritedFields,
      ...(fields as SchemaFieldMap),
    };

    definitions.push({
      kind: PropertyKind.entity,
      name,
      fields: mergedFields,
      extends: inheritedSources,
      abstract: optionsArg.abstract,
    });

    refs[name] = createEntityRefs(options, name, mergedFields, fields as SchemaFieldMap, inheritedSources, optionsArg.abstract === true);

    return registry() as NamedEntityPropertyRegistry<TName, MergedEntityFieldRefs<TExtends, EntityFieldRefs<TEntity, TFields>>>;
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
  sourceKind: PropertyKind,
): PropertyRefGroup {
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, createPropertyRef(options, name, key, sourceKind, field)]));
}

function createPropertyRef(
  options: DefinePropertiesOptions,
  name: string,
  key: string,
  sourceKind: PropertyKind,
  field: unknown,
): PropertyRefGroup[string] {
  const refId = createScopedId(options, EngineIdPart.property, name, key);
  const isShared = sourceKind === PropertyKind.shared;

  return withRefMethods({
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
  });
}

function createModelRef(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: string,
  fields: PropertyRefGroup,
  sourceFields?: SchemaFieldMap,
  inherited?: readonly EntityInheritanceInput[],
  isAbstract = false,
): ModelRef {
  const refId = createScopedId(options, EngineIdPart.model, name, modelKey);

  return {
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
}

function getModelSchemaName(name: string, modelKey: string, isAbstract: boolean): string {
  if (isAbstract) return toSchemaName(name);
  if (modelKey === 'public-model') return toSchemaName(`${name}PublicModel`);
  if (modelKey === 'partial-model') return toSchemaName(`${name}PartialModel`);
  if (modelKey === 'selected-model') return toSchemaName(`${name}SelectedModel`);
  return toSchemaName(`${name}Model`);
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
): ModelRef {
  return createModelRef(
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
  );
}

function createSortModel(options: DefinePropertiesOptions, name: string, fields: SchemaFieldMap, refs: PropertyRefGroup): ModelRef {
  return createModelRef(
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
  );
}

function normalizeExtends(value: EntityOptions['extends']): EntityInheritanceInput[] {
  if (!value) return [];

  const sources = Array.isArray(value) ? value : [value];

  return sources.map((source) => {
    if (isEntityPropertyRefs(source) || isPropertyRefGroup(source)) {
      return source;
    }

    throw new Error(
      'Invalid `extends` option. Use `extends: baseEntity.ref.BaseEntity` or `extends: baseFields.ref.BaseFields`, not the full registry returned by `.entity()` or `.shared()`.',
    );
  });
}

function getInheritanceFields(source: EntityInheritanceInput): PropertyRefGroup {
  if (isEntityPropertyRefs(source)) {
    return source.fields;
  }

  if (isPropertyRefGroup(source)) {
    return source;
  }

  throw new Error(
    'Invalid entity inheritance source. Use `extends: baseEntity.ref.BaseEntity` or `extends: baseFields.ref.BaseFields`. Do not pass the full registry object.',
  );
}

function mergeInheritedPropertyGroups(sources: readonly EntityInheritanceInput[]): SchemaFieldMap {
  const merged: SchemaFieldMap = {};

  for (const source of sources) {
    const fields = getInheritanceFields(source);

    for (const [key, ref] of Object.entries(fields)) {
      merged[key] = ref;
    }
  }

  return merged;
}

function mergeInheritedFields(inherited: readonly EntityInheritanceInput[], ownFields: SchemaFieldMap): SchemaFieldMap {
  const inheritedFields = mergeInheritedPropertyGroups(inherited);

  return {
    ...inheritedFields,
    ...ownFields,
  };
}

function createEntityRefs(
  options: DefinePropertiesOptions,
  name: string,
  mergedFields: SchemaFieldMap,
  ownFields: SchemaFieldMap,
  inheritedSources: EntityInheritanceInput[],
  isAbstract = false,
): EntityPropertyRefs {
  const fieldRefs = createPropertyRefs(options, name, mergedFields, PropertyKind.entity);

  return {
    name,
    fields: fieldRefs,
    abstract: isAbstract,
    schemaRef: `#/components/schemas/${toSchemaName(name)}`,
    model: createModelRef(options, name, isAbstract ? 'abstract-model' : 'model', fieldRefs, mergedFields, inheritedSources, isAbstract),
    publicModel: createModelRef(options, name, 'public-model', filterPublicFields(mergedFields, fieldRefs), mergedFields, inheritedSources),
    selectedModel: createModelRef(
      options,
      name,
      'selected-model',
      filterSelectedFields(mergedFields, fieldRefs),
      mergedFields,
      inheritedSources,
    ),
    partialModel: createModelRef(options, name, 'partial-model', fieldRefs, mergedFields, inheritedSources),
    query: createQueryRefs(options, name, mergedFields, fieldRefs),
  };
}

function createInheritanceMeta(inherited: readonly EntityInheritanceInput[] | undefined): ModelRef['inherits'] {
  if (!inherited || inherited.length === 0) return undefined;

  return inherited.map((source) => {
    if (isEntityPropertyRefs(source)) {
      return {
        ref: source.schemaRef ?? `#/components/schemas/${toSchemaName(source.name)}`,
        fields: Object.keys(source.fields),
      };
    }

    const firstRef = Object.values(source)[0];
    const groupName = inferGroupNameFromRefId(firstRef?.id);

    return {
      ref: `${OpenApiRefPattern.schemas}${toSchemaName(groupName)}`,
      fields: Object.keys(source),
    };
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
