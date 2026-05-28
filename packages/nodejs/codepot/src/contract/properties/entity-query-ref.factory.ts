import { z } from 'zod';

import { withRefMethods } from '../refs/ref-methods.js';
import type { GeneratedBooleanPropertySchema, GeneratedEnumPropertySchema, ModelRef, PropertyRef } from '../refs/ref.types.js';
import type { RefWithUsageMethods } from '../refs/ref-usage.types.js';
import { QueryOperator } from '../schema/query-behavior.js';
import { SchemaKind } from '../schema/schema-kind.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';

import type { DefinePropertiesOptions } from './define-properties.js';
import { createModelRef } from './model-ref.factory.js';
import { createPropertyRef } from './property-ref.factory.js';
import { PropertyKind } from './property-kind.js';
import { hasFieldOptions, isSelectableField } from './entity-field-filters.js';
import type { EntityPropertyRefs, EntityValueRefs, PropertyRefGroup } from './property.types.js';

export function createEntityQueryHelpers(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
  inherited?: readonly EntityPropertyRefs[],
): {
  queryFilterModel: RefWithUsageMethods<ModelRef>;
  advancedQueryFilterModel: RefWithUsageMethods<ModelRef>;
  values: EntityValueRefs;
} {
  return {
    queryFilterModel: createFilterModel(options, name, fields, refs, inherited),
    advancedQueryFilterModel: createAdvancedFilterModel(options, name, fields, refs, inherited),
    values: {
      querySort: createSortValueRef(options, name, fields, refs),
      querySelect: createSelectValueRef(options, name, fields, refs),
    },
  };
}

function createFilterModel(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
  inherited?: readonly EntityPropertyRefs[],
): RefWithUsageMethods<ModelRef> {
  const filterRefs = Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];

      return (
        hasFieldOptions(field) &&
        'query' in field &&
        !!field.query &&
        field.query.filter === true &&
        field.query.operators?.includes(QueryOperator.exact)
      );
    }),
  );

  return withRefMethods(createModelRef(options, name, 'query-filter', filterRefs, fields, inherited));
}

function createAdvancedFilterModel(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
  inherited?: readonly EntityPropertyRefs[],
): RefWithUsageMethods<ModelRef> {
  const advancedFilterRefs: PropertyRefGroup = {};

  for (const [key, ref] of Object.entries(refs)) {
    const field = fields[key];

    if (!hasFieldOptions(field) || !('query' in field) || !field.query || field.query.filter !== true) {
      continue;
    }

    const operators = field.query.operators ?? [];

    if (operators.includes(QueryOperator.search)) {
      advancedFilterRefs[`${key}Search`] = ref;
    }

    if (operators.includes(QueryOperator.in)) {
      advancedFilterRefs[`${key}In`] = ref.array();
    }

    if (operators.includes(QueryOperator.range)) {
      advancedFilterRefs[`${key}Gte`] = ref;
      advancedFilterRefs[`${key}Lte`] = ref;
    }

    if (operators.includes(QueryOperator.exists)) {
      advancedFilterRefs[`${key}Exists`] = createBooleanPropertyRef(options, name, `${key}Exists`);
    }
  }

  return withRefMethods(createModelRef(options, name, 'advanced-query-filter', advancedFilterRefs, fields, inherited));
}

function createBooleanPropertyRef(options: DefinePropertiesOptions, name: string, key: string): RefWithUsageMethods<PropertyRef> {
  const generatedSchema: GeneratedBooleanPropertySchema = {
    kind: 'boolean',
  };

  return createPropertyRef(
    options,
    name,
    key,
    PropertyKind.entity,
    {
      kind: SchemaKind.primitive,
      zod: z.boolean(),
      query: {
        filter: false,
        operators: [],
        sort: false,
      },
    },
    undefined,
    generatedSchema,
  );
}

function createSortValueRef(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): RefWithUsageMethods<PropertyRef> {
  const sortFields = Object.keys(refs).filter((key) => {
    const field = fields[key];

    return hasFieldOptions(field) && 'query' in field && !!field.query && field.query.sort === true;
  });

  return createEnumPropertyRef(
    options,
    name,
    'query-sort-value',
    sortFields.flatMap((field) => [`+${field}`, `-${field}`]),
  );
}

function createSelectValueRef(
  options: DefinePropertiesOptions,
  name: string,
  fields: SchemaFieldMap,
  refs: PropertyRefGroup,
): RefWithUsageMethods<PropertyRef> {
  const selectFields = Object.keys(refs).filter((key) => {
    return isSelectableField(fields[key]);
  });

  return createEnumPropertyRef(options, name, 'query-select-value', selectFields);
}

function createEnumPropertyRef(
  options: DefinePropertiesOptions,
  name: string,
  key: string,
  values: readonly string[],
): RefWithUsageMethods<PropertyRef> {
  const safeValues = values.length > 0 ? values : ['__none__'];

  const generatedSchema: GeneratedEnumPropertySchema = {
    kind: 'enum',
    values: safeValues,
  };

  return createPropertyRef(
    options,
    name,
    key,
    PropertyKind.entity,
    {
      kind: SchemaKind.primitive,
      zod: z.enum(safeValues as [string, ...string[]]),
      query: {
        filter: false,
        operators: [],
        sort: false,
      },
    },
    undefined,
    generatedSchema,
  );
}
