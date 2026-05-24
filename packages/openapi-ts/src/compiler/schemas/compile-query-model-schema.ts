import type { ModelRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import {
  XCodegenDtoRole,
  XCodegenEntityVariant,
  XCodegenKind,
  type CodegenMetadata,
  type XCodegenEntityMeta,
} from '../../sdk/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { SchemaKind } from '../../schema/schema-kind.js';
import type { QueryModelOptions } from '../../config/query-model-defaults.js';
import { DEFAULT_QUERY_MODEL_OPTIONS } from '../../config/query-model-defaults.js';

export type QueryModelBehavior = 'filter' | 'advanced-filter';

export interface CompileQueryModelContext {
  readonly queryModelOptions?: QueryModelOptions;
}

export interface EnumComponentExtraction {
  readonly componentName: string;
  readonly schema: Record<string, unknown>;
}

/**
 * Compiles generated entity query helper models.
 *
 * Current supported generated query model:
 * - {Entity}QueryFilter
 *
 * Sort/select value refs are no longer compiled here. They are virtual
 * property enum refs and are emitted separately by the component compiler.
 */
export function compileQueryModelSchema(
  ref: ModelRef,
  context: CompileQueryModelContext = {},
): {
  schema: Record<string, unknown>;
  enumComponents?: EnumComponentExtraction[];
} {
  const options = context.queryModelOptions ?? DEFAULT_QUERY_MODEL_OPTIONS;
  const behavior = getQueryBehaviorFromModelKey(ref.modelKey);

  const parentRefs = ref.inherits ?? [];
  const inheritedFieldNames = new Set(parentRefs.flatMap((inherit) => inherit.fields ?? []));

  const ownFields = Object.fromEntries(
    Object.entries(ref.fields ?? {}).filter(([key]) => {
      return !inheritedFieldNames.has(key);
    }),
  );

  const result = compileQueryBehaviorSchema(ownFields, behavior, options);
  const schemaWithInheritance = withQueryInheritance(result.schema, parentRefs);
  const schemaWithCodegen = applyCodegenMetadata(schemaWithInheritance, toQueryCodegenMetadata(ref, parentRefs));

  return {
    schema: schemaWithCodegen,
    enumComponents: result.enumComponents,
  };
}

function getQueryBehaviorFromModelKey(modelKey: string): QueryModelBehavior {
  if (modelKey === 'query-filter') return 'filter';
  if (modelKey === 'advanced-query-filter') return 'advanced-filter';

  throw new Error(
    [
      `Unknown query model behavior for modelKey: ${modelKey}.`,
      'Only "query-filter" and "advanced-query-filter" are supported by the current query helper compiler.',
      'Sort/select values are emitted as virtual enum property refs, not query models.',
    ].join(' '),
  );
}

function compileQueryBehaviorSchema(
  fields: Record<string, unknown>,
  behavior: QueryModelBehavior,
  _options: QueryModelOptions,
): {
  schema: Record<string, unknown>;
  enumComponents?: EnumComponentExtraction[];
} {
  switch (behavior) {
    case 'filter':
      return {
        schema: compileBasicFilterQuerySchema(fields),
      };
    case 'advanced-filter':
      return {
        schema: compileBasicFilterQuerySchema(fields),
      };
  }
}

/**
 * Basic filter model.
 *
 * This intentionally supports only direct field=value filters for now.
 * Advanced filters like search/in/range/exists suffix fields are not compiled here yet.
 */
function compileBasicFilterQuerySchema(fields: Record<string, unknown>): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [key, fieldRef] of Object.entries(fields)) {
    properties[key] = compileFieldSchemaRef(fieldRef);
  }

  return {
    type: 'object',
    properties,
  };
}

function withQueryInheritance(schema: Record<string, unknown>, parentRefs: ModelRef['inherits']): Record<string, unknown> {
  if (!parentRefs || parentRefs.length === 0) return schema;

  const parentRefsAsAllOf = parentRefs.map((parent) => ({
    $ref: parent.modelRef.openapiRef ?? `#pending/${parent.modelRef.id}`,
  }));

  if (Array.isArray(schema.allOf)) {
    const existingRefs = new Set(
      schema.allOf
        .filter((item): item is { $ref: string } => {
          return !!item && typeof item === 'object' && '$ref' in item && typeof item.$ref === 'string';
        })
        .map((item) => item.$ref),
    );

    const missingParents = parentRefsAsAllOf.filter((item) => !existingRefs.has(item.$ref));

    if (missingParents.length === 0) return schema;

    return {
      ...schema,
      allOf: [...missingParents, ...schema.allOf],
    };
  }

  return {
    allOf: [...parentRefsAsAllOf, schema],
  };
}

function toQueryCodegenMetadata(ref: ModelRef, parentRefs: ModelRef['inherits']): CodegenMetadata {
  const inherits =
    parentRefs && parentRefs.length > 0
      ? parentRefs.map((parent) => ({
          $ref: parent.modelRef.openapiRef ?? `#pending/${parent.modelRef.id}`,
        }))
      : undefined;

  const entityName = inferEntityNameFromModelRef(ref);

  const entityMeta: XCodegenEntityMeta | undefined = entityName
    ? {
        name: entityName,
        variant: XCodegenEntityVariant.partial,
      }
    : undefined;

  return {
    kind: XCodegenKind.dto,
    role: XCodegenDtoRole.query,
    resource: ref.meta?.resource,
    entity: entityMeta,
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
    // Handle generated boolean schema for exists filters
    if (fieldRef.generatedSchema?.kind === 'boolean') {
      return { type: 'boolean' };
    }

    return {
      $ref: `#pending/${fieldRef.targetRefId ?? fieldRef.id}`,
    };
  }

  throw new Error('Query filter model fields must be property refs or ref usages.');
}

function inferEntityNameFromModelRef(ref: ModelRef): string | undefined {
  if (!ref.name) return undefined;

  const [entityName] = ref.name.split('.');
  return entityName || undefined;
}
