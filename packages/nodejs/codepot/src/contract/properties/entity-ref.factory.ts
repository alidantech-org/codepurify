import type { z } from 'zod';
import type { SchemaField, SchemaFieldMap } from '../schema/schema.types';
import type { DefinePropertiesOptions } from './define-properties';
import { filterInternalFields, filterPublicFields } from './entity-field-filters';
import { createEntityQueryHelpers } from './entity-query-ref.factory';
import { createModelRef } from './model-ref.factory';
import { createPropertyRefs } from './property-ref.factory';
import { PropertyKind } from './property-kind';
import type { EntityFieldRefs, EntityOptions, EntityPropertyRefs, PropertyRefGroup } from './property.types';
import { withRefMethods } from '../refs/ref-methods';
import { resolveModelEmission } from '../config/resolve-model-emission';
import { resolveQueryModelOptions } from '../config/resolve-query-model-options';
import { toSchemaName } from '@/utils/naming/schema-name';

export function createEntityRefs<TFields extends Record<string, SchemaField>>(
  options: DefinePropertiesOptions,
  name: string,
  fields: TFields,
  inherited: readonly EntityPropertyRefs[] = [],
  isAbstract = false,
  toZod?: (ref: unknown) => z.ZodTypeAny,
  entityOptions?: EntityOptions,
): EntityPropertyRefs<EntityFieldRefs<TFields>> {
  const sourceFields = fields as SchemaFieldMap;

  const fieldRefs = createPropertyRefs(options, name, sourceFields, PropertyKind.entity, toZod) as EntityFieldRefs<TFields>;

  const modelEmission = resolveModelEmission(options.modelEmission, entityOptions?.emitModels);

  const queryModelOptions = resolveQueryModelOptions(options.queryModels, entityOptions?.queryModels);

  const queryHelpers = createEntityQueryHelpers(options, name, sourceFields, fieldRefs, inherited);

  return {
    name,
    fields: fieldRefs,
    abstract: isAbstract,
    schemaRef: `#/components/schemas/${toSchemaName(name)}`,

    model: createWrappedModelRef(options, name, isAbstract ? 'abstract-model' : 'model', fieldRefs, sourceFields, inherited, isAbstract),

    publicModel: createWrappedModelRef(options, name, 'public-model', filterPublicFields(sourceFields, fieldRefs), sourceFields, inherited),

    internalModel: createWrappedModelRef(
      options,
      name,
      'internal-model',
      filterInternalFields(sourceFields, fieldRefs),
      sourceFields,
      inherited,
    ),

    partialModel: createWrappedModelRef(options, name, 'partial-model', fieldRefs, sourceFields, inherited),

    publicPartialModel: createWrappedModelRef(
      options,
      name,
      'public-partial-model',
      filterPublicFields(sourceFields, fieldRefs),
      sourceFields,
      inherited,
    ),

    internalPartialModel: createWrappedModelRef(
      options,
      name,
      'internal-partial-model',
      filterInternalFields(sourceFields, fieldRefs),
      sourceFields,
      inherited,
    ),

    queryFilterModel: queryHelpers.queryFilterModel,
    advancedQueryFilterModel: queryHelpers.advancedQueryFilterModel,
    values: queryHelpers.values,

    modelEmission,
    queryModelOptions,
  };
}

function createWrappedModelRef(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: Parameters<typeof createModelRef>[2],
  fields: PropertyRefGroup,
  sourceFields: SchemaFieldMap,
  inherited: readonly EntityPropertyRefs[],
  isAbstract = false,
) {
  return withRefMethods(createModelRef(options, name, modelKey, fields, sourceFields, inherited, isAbstract));
}
