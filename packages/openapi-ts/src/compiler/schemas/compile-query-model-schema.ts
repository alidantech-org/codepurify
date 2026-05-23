import type { ModelRef, PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { SchemaKind } from '../../schema/schema-kind.js';
import type { QueryModelOptions } from '../../config/query-model-defaults.js';
import { DEFAULT_QUERY_MODEL_OPTIONS } from '../../config/query-model-defaults.js';

export type QueryModelBehavior = 'exact' | 'search' | 'exactSearch' | 'range' | 'in' | 'exists' | 'sort' | 'select';

export interface CompileQueryModelContext {
  queryModelOptions?: QueryModelOptions;
}

export interface EnumComponentExtraction {
  componentName: string;
  schema: Record<string, unknown>;
}

export function compileQueryModelSchema(
  ref: ModelRef,
  context: CompileQueryModelContext = {},
): { schema: Record<string, unknown>; enumComponents?: EnumComponentExtraction[] } {
  const behavior = getQueryBehaviorFromModelKey(ref.modelKey);
  const options = context.queryModelOptions ?? DEFAULT_QUERY_MODEL_OPTIONS;

  const parentRefs = ref.inherits ?? [];
  const inheritedFieldNames = new Set(parentRefs.flatMap((inherit) => inherit.fields ?? []));

  const ownFields = Object.fromEntries(Object.entries(ref.fields ?? {}).filter(([key]) => !inheritedFieldNames.has(key)));

  const result = compileQueryBehaviorSchema(ownFields, behavior, options, ref);

  const schemaWithInheritance = withQueryInheritance(result.schema, parentRefs);
  const schemaWithCodegen = applyCodegenMetadata(schemaWithInheritance, toQueryCodegenMetadata(ref, behavior, parentRefs));

  return {
    schema: schemaWithCodegen,
    enumComponents: result.enumComponents,
  };
}

function getQueryBehaviorFromModelKey(modelKey: string): QueryModelBehavior {
  switch (modelKey) {
    case 'query-exact':
      return 'exact';
    case 'query-search':
      return 'search';
    case 'query-exact-search':
      return 'exactSearch';
    case 'query-range':
      return 'range';
    case 'query-in':
      return 'in';
    case 'query-exists':
      return 'exists';
    case 'query-sort':
      return 'sort';
    case 'query-select':
      return 'select';
    default:
      throw new Error(`Unknown query model behavior for modelKey: ${modelKey}`);
  }
}

function compileQueryBehaviorSchema(
  fields: Record<string, unknown>,
  behavior: QueryModelBehavior,
  options: QueryModelOptions,
  ref: ModelRef,
): { schema: Record<string, unknown>; enumComponents?: EnumComponentExtraction[] } {
  switch (behavior) {
    case 'exact':
      return { schema: compileValueBasedQuerySchema(fields, options.exact.valueMode) };

    case 'search':
      return { schema: compileValueBasedQuerySchema(fields, options.search.valueMode) };

    case 'exactSearch':
      return { schema: compileValueBasedQuerySchema(fields, options.exactSearch.valueMode) };

    case 'range':
      return { schema: compileRangeQuerySchema(fields, options.range.mode) };

    case 'in':
      return { schema: compileInQuerySchema(fields) };

    case 'exists':
      return { schema: compileExistsQuerySchema(fields, options.exists.valueMode) };

    case 'sort':
      return compileSortQuerySchema(fields, options.sort, ref);

    case 'select':
      return compileSelectQuerySchema(fields, ref);
  }
}

function compileValueBasedQuerySchema(fields: Record<string, unknown>, valueMode: 'field-schema' | 'string'): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    properties[key] = valueMode === 'string' ? { type: 'string' } : compileFieldSchemaRef(fieldRef);
  }

  return {
    type: 'object',
    properties,
  };
}

function compileRangeQuerySchema(fields: Record<string, unknown>, mode: 'field-schema'): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    if (mode === 'field-schema') {
      properties[key] = compileFieldSchemaRef(fieldRef);
    }
  }

  return {
    type: 'object',
    properties,
  };
}

function compileInQuerySchema(fields: Record<string, unknown>): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    properties[key] = compileArrayOfFieldSchema(fieldRef);
  }

  return {
    type: 'object',
    properties,
  };
}

function compileExistsQuerySchema(fields: Record<string, unknown>, valueMode: 'field-schema' | 'boolean'): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    properties[key] = valueMode === 'boolean' ? { type: 'boolean' } : compileFieldSchemaRef(fieldRef);
  }

  return {
    type: 'object',
    properties,
  };
}

function compileSortQuerySchema(
  fields: Record<string, unknown>,
  options: QueryModelOptions['sort'],
  ref: ModelRef,
): { schema: Record<string, unknown>; enumComponents?: EnumComponentExtraction[] } {
  const fieldNames = Object.keys(fields);

  switch (options.mode) {
    case 'flat-prefixed-field':
      return compileFlatPrefixedFieldSortSchema(fieldNames, options, ref);

    case 'field-direction-object':
      return compileFieldDirectionObjectSortSchema(fieldNames, ref);

    case 'flat-field-direction':
      return compileFlatFieldDirectionSortSchema(fieldNames, options.separator, ref);
  }
}

function compileFlatPrefixedFieldSortSchema(
  fieldNames: readonly string[],
  options: QueryModelOptions['sort'],
  ref: ModelRef,
): { schema: Record<string, unknown>; enumComponents: EnumComponentExtraction[] } {
  const enumValues = buildSortEnumValues(fieldNames, options);
  const enumComponent = createQueryValueEnumComponent({
    ref,
    behavior: 'sort-value',
    fallbackComponentName: 'QuerySortValue',
    enumValues,
  });

  const schema = {
    type: 'object',
    properties: {
      sort: {
        $ref: `#/components/schemas/${enumComponent.componentName}`,
      },
    },
  };

  return {
    schema,
    enumComponents: [enumComponent],
  };
}

function compileFlatFieldDirectionSortSchema(
  fieldNames: readonly string[],
  separator: string,
  ref: ModelRef,
): { schema: Record<string, unknown>; enumComponents: EnumComponentExtraction[] } {
  const enumValues: string[] = [];

  for (const fieldName of fieldNames) {
    enumValues.push(`${fieldName}${separator}asc`);
    enumValues.push(`${fieldName}${separator}desc`);
  }

  const enumComponent = createQueryValueEnumComponent({
    ref,
    behavior: 'sort-value',
    fallbackComponentName: 'QuerySortValue',
    enumValues,
  });

  const schema = {
    type: 'object',
    properties: {
      sort: {
        $ref: `#/components/schemas/${enumComponent.componentName}`,
      },
    },
  };

  return {
    schema,
    enumComponents: [enumComponent],
  };
}

function compileFieldDirectionObjectSortSchema(
  fieldNames: readonly string[],
  ref: ModelRef,
): { schema: Record<string, unknown>; enumComponents: EnumComponentExtraction[] } {
  const entityName = inferEntityNameFromModelRef(ref);
  const directionEnumName = entityName ? `${entityName}QuerySortDirection` : 'QuerySortDirection';

  const directionEnumSchema = applyCodegenMetadata(
    {
      type: 'string',
      enum: ['asc', 'desc'],
    },
    {
      kind: 'enum',
      resource: ref.meta?.resource,
      group: ref.meta?.group,
      entity: entityName,
      behavior: 'sort-direction',
      refId: buildQueryValueRefId(ref, 'sort-direction'),
    },
  );

  const properties: Record<string, unknown> = {};

  for (const fieldName of fieldNames) {
    properties[fieldName] = {
      $ref: `#/components/schemas/${directionEnumName}`,
    };
  }

  return {
    schema: {
      type: 'object',
      properties,
    },
    enumComponents: [
      {
        componentName: directionEnumName,
        schema: directionEnumSchema,
      },
    ],
  };
}

function compileSelectQuerySchema(
  fields: Record<string, unknown>,
  ref: ModelRef,
): { schema: Record<string, unknown>; enumComponents: EnumComponentExtraction[] } {
  const fieldNames = Object.keys(fields);

  const enumComponent = createQueryValueEnumComponent({
    ref,
    behavior: 'select-value',
    fallbackComponentName: 'QuerySelectValue',
    enumValues: fieldNames,
  });

  const schema = {
    type: 'object',
    properties: {
      select: {
        type: 'array',
        items: {
          $ref: `#/components/schemas/${enumComponent.componentName}`,
        },
      },
    },
  };

  return {
    schema,
    enumComponents: [enumComponent],
  };
}

function createQueryValueEnumComponent(input: {
  ref: ModelRef;
  behavior: 'sort-value' | 'select-value';
  fallbackComponentName: string;
  enumValues: readonly string[];
}): EnumComponentExtraction {
  const { ref, behavior, fallbackComponentName, enumValues } = input;

  const entityName = inferEntityNameFromModelRef(ref);
  const componentName = entityName
    ? `${entityName}${behavior === 'sort-value' ? 'QuerySortValue' : 'QuerySelectValue'}`
    : fallbackComponentName;

  const enumSchema = applyCodegenMetadata(
    {
      type: 'string',
      enum: enumValues,
    },
    {
      kind: 'enum',
      resource: ref.meta?.resource,
      group: ref.meta?.group,
      entity: entityName,
      behavior,
      refId: buildQueryValueRefId(ref, behavior),
    },
  );

  return {
    componentName,
    schema: enumSchema,
  };
}

function withQueryInheritance(schema: Record<string, unknown>, parentRefs: ModelRef['inherits']): Record<string, unknown> {
  if (!parentRefs || parentRefs.length === 0) {
    return schema;
  }

  const allOf = [
    ...parentRefs.map((parent) => ({
      $ref: parent.modelRef.openapiRef ?? `#pending/${parent.modelRef.id}`,
    })),
    schema,
  ];

  return {
    allOf,
  };
}

function toQueryCodegenMetadata(ref: ModelRef, behavior: QueryModelBehavior, parentRefs: ModelRef['inherits']): CodegenMetadata {
  const inherits =
    parentRefs && parentRefs.length > 0
      ? parentRefs.map((parent) => ({
          $ref: parent.modelRef.openapiRef ?? `#pending/${parent.modelRef.id}`,
        }))
      : undefined;

  return {
    kind: 'query',
    resource: ref.meta?.resource,
    group: ref.meta?.group,
    entity: inferEntityNameFromModelRef(ref),
    behavior,
    refId: ref.id,
    inherits,
  };
}

function compileFieldSchemaRef(fieldRef: unknown): unknown {
  if (isRefUsage(fieldRef)) {
    const refField: SchemaField = {
      kind: SchemaKind.ref,
      ref: fieldRef as never,
      required: false,
    };

    return compilePropertySchema(refField);
  }

  if (isPropertyRef(fieldRef)) {
    return {
      $ref: `#pending/${fieldRef.targetRefId ?? fieldRef.id}`,
    };
  }

  throw new Error('Query model fields must be property refs or ref usages.');
}

function compileArrayOfFieldSchema(fieldRef: unknown): unknown {
  return {
    type: 'array',
    items: compileFieldSchemaRef(fieldRef),
  };
}

function buildSortEnumValues(fieldNames: readonly string[], options: QueryModelOptions['sort']): readonly string[] {
  const values: string[] = [];

  for (const fieldName of fieldNames) {
    values.push(`${options.prefixes.asc}${fieldName}`);
    values.push(`${options.prefixes.desc}${fieldName}`);
  }

  return values;
}

function buildQueryValueRefId(ref: ModelRef, behavior: 'sort-value' | 'select-value' | 'sort-direction'): string {
  const suffix =
    behavior === 'sort-value' ? 'query-sort-value' : behavior === 'select-value' ? 'query-select-value' : 'query-sort-direction';

  const base = ref.id.replace(/:query-(sort|select)$/, '');

  return `${base}:${suffix}`;
}

function inferEntityNameFromModelRef(ref: ModelRef): string | undefined {
  if (ref.name) {
    const [entityName] = ref.name.split('.');
    return entityName || undefined;
  }

  return undefined;
}
