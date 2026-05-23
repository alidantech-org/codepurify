import type { ModelRef, PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';
import { toOpenApiSchemaRef } from '../refs/to-openapi-ref.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { SchemaKind } from '../../schema/schema-kind.js';
import type { QueryModelOptions } from '../../config/query-model-defaults.js';
import { DEFAULT_QUERY_MODEL_OPTIONS } from '../../config/query-model-defaults.js';

export type QueryModelBehavior = 'exact' | 'search' | 'exactSearch' | 'range' | 'in' | 'exists' | 'sort' | 'select';

export interface CompileQueryModelContext {
  queryModelOptions?: QueryModelOptions;
}

export function compileQueryModelSchema(ref: ModelRef, context: CompileQueryModelContext = {}): Record<string, unknown> {
  const behavior = getQueryBehaviorFromModelKey(ref.modelKey);
  if (!behavior) {
    throw new Error(`Unknown query model behavior for modelKey: ${ref.modelKey}`);
  }

  const options = context.queryModelOptions ?? DEFAULT_QUERY_MODEL_OPTIONS;

  // Filter to only own fields (not inherited) to avoid duplication in enums
  const parentRefs = ref.inherits ?? [];
  const inheritedFieldNames = new Set(parentRefs.flatMap((inherit) => inherit.fields ?? []));
  const ownFields = Object.fromEntries(Object.entries(ref.fields ?? {}).filter(([key]) => !inheritedFieldNames.has(key)));

  const ownSchema = compileQueryBehaviorSchema(ownFields, behavior, options);

  // Return only the own schema - compileModelSchema will handle allOf wrapping
  return ownSchema;
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
): Record<string, unknown> {
  switch (behavior) {
    case 'exact':
      return compileValueBasedQuerySchema(fields, options.exact.valueMode);
    case 'search':
      return compileValueBasedQuerySchema(fields, options.search.valueMode);
    case 'exactSearch':
      return compileValueBasedQuerySchema(fields, options.exactSearch.valueMode);
    case 'range':
      return compileRangeQuerySchema(fields, options.range.mode);
    case 'in':
      return compileInQuerySchema(fields);
    case 'exists':
      return compileExistsQuerySchema(fields, options.exists.valueMode);
    case 'sort':
      return compileSortQuerySchema(fields, options.sort);
    case 'select':
      return compileSelectQuerySchema(fields);
  }
}

function compileValueBasedQuerySchema(fields: Record<string, unknown>, valueMode: 'field-schema' | 'string'): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    if (valueMode === 'string') {
      properties[key] = { type: 'string' };
    } else {
      properties[key] = compileFieldSchemaRef(fieldRef);
    }
  }

  return { type: 'object', properties };
}

function compileRangeQuerySchema(fields: Record<string, unknown>, mode: 'field-schema'): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    switch (mode) {
      case 'field-schema':
        properties[key] = compileFieldSchemaRef(fieldRef);
        break;
    }
  }

  return { type: 'object', properties };
}

function compileInQuerySchema(fields: Record<string, unknown>): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    properties[key] = compileArrayOfFieldSchema(fieldRef);
  }

  return { type: 'object', properties };
}

function compileExistsQuerySchema(fields: Record<string, unknown>, valueMode: 'field-schema' | 'boolean'): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    if (valueMode === 'boolean') {
      properties[key] = { type: 'boolean' };
    } else {
      properties[key] = compileFieldSchemaRef(fieldRef);
    }
  }

  return { type: 'object', properties };
}

function compileSortQuerySchema(fields: Record<string, unknown>, options: QueryModelOptions['sort']): Record<string, unknown> {
  const fieldNames = Object.keys(fields);

  switch (options.mode) {
    case 'flat-prefixed-field':
      return compileFlatPrefixedFieldSortSchema(fieldNames, options);
    case 'field-direction-object':
      return compileFieldDirectionObjectSortSchema(fieldNames);
    case 'flat-field-direction':
      return compileFlatFieldDirectionSortSchema(fieldNames, options.separator);
  }
}

function compileFlatPrefixedFieldSortSchema(fieldNames: readonly string[], options: QueryModelOptions['sort']): Record<string, unknown> {
  const enumValues = buildSortEnumValues(fieldNames, options);

  return {
    type: 'object',
    properties: {
      sort: {
        type: 'string',
        enum: enumValues,
      },
    },
  };
}

function compileFieldDirectionObjectSortSchema(fieldNames: readonly string[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const fieldName of fieldNames) {
    properties[fieldName] = {
      type: 'string',
      enum: ['asc', 'desc'],
    };
  }

  return { type: 'object', properties };
}

function compileFlatFieldDirectionSortSchema(fieldNames: readonly string[], separator: string): Record<string, unknown> {
  const enumValues: string[] = [];

  for (const fieldName of fieldNames) {
    enumValues.push(`${fieldName}${separator}asc`);
    enumValues.push(`${fieldName}${separator}desc`);
  }

  return {
    type: 'object',
    properties: {
      sort: {
        type: 'string',
        enum: enumValues,
      },
    },
  };
}

function compileSelectQuerySchema(fields: Record<string, unknown>): Record<string, unknown> {
  const fieldNames = Object.keys(fields);

  return {
    type: 'object',
    properties: {
      select: {
        type: 'array',
        items: {
          type: 'string',
          enum: fieldNames,
        },
      },
    },
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
    return { $ref: `#pending/${fieldRef.targetRefId ?? fieldRef.id}` };
  }

  throw new Error('Query model fields must be property refs or ref usages.');
}

function compileArrayOfFieldSchema(fieldRef: unknown): unknown {
  const itemSchema = compileFieldSchemaRef(fieldRef);

  return {
    type: 'array',
    items: itemSchema,
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

function inferEntityNameFromModelRef(ref: ModelRef): string | undefined {
  if (ref.name) {
    const parts = ref.name.split('.');
    if (parts.length > 0) {
      return parts[0];
    }
  }
  return undefined;
}

function hasMeaningfulModelFields(ref: ModelRef): boolean {
  // Check if the model has any fields defined
  const fields = ref.fields ?? {};
  if (Object.keys(fields).length > 0) {
    return true;
  }

  // For query models, behavior-specific compilers may emit meaningful schemas
  // even with no direct fields (e.g., sort/select with transformed output)
  const behavior = getQueryBehaviorFromModelKey(ref.modelKey);
  if (behavior) {
    // Sort and select always emit meaningful schemas if they exist
    if (behavior === 'sort' || behavior === 'select') {
      return true;
    }
  }

  return false;
}

function toQueryCodegenMetadata(ref: ModelRef, behavior: QueryModelBehavior, parentRefs?: ModelRef['inherits']): CodegenMetadata {
  const inherits =
    parentRefs && parentRefs.length > 0
      ? parentRefs.map((p) => ({ $ref: p.modelRef.openapiRef ?? `#pending/${p.modelRef.id}` }))
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
