import type { z } from 'zod';

import type { ModelRef, PropertyRef } from '../refs/ref.types.js';
import type { SchemaField, SchemaFieldMap } from '../schema/schema.types.js';
import { toSchemaName } from '../naming/schema-name.js';

import type { DefinePropertiesOptions } from './define-properties.js';
import { filterInternalFields, filterPublicFields } from './entity-field-filters.js';
import { createEntityQueryHelpers } from './entity-query-ref.factory.js';
import { createModelRef } from './model-ref.factory.js';
import { createPropertyRefs } from './property-ref.factory.js';
import { PropertyKind } from './property-kind.js';
import type { EntityOptions, EntityPropertyRefs, PropertyRefGroup } from './property.types.js';

import { withRefMethods } from '../refs/ref-methods.js';

import { resolveModelEmission } from '../config/resolve-model-emission.js';
import { resolveQueryModelOptions } from '../config/resolve-query-model-options.js';

export function createEntityRefs(
  options: DefinePropertiesOptions,
  name: string,
  fields: Record<string, SchemaField>,
  inherited: readonly EntityPropertyRefs[] = [],
  isAbstract = false,
  toZod?: (ref: unknown) => z.ZodTypeAny,
  entityOptions?: EntityOptions,
): EntityPropertyRefs {
  const sourceFields = fields as SchemaFieldMap;

  const fieldRefs = createPropertyRefs(options, name, sourceFields, PropertyKind.entity, toZod);

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
