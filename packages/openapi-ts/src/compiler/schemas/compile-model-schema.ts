import type { ModelRef, PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';
import { toOpenApiSchemaRef } from '../refs/to-openapi-ref.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { SchemaKind } from '../../schema/schema-kind.js';
import { compileQueryModelSchema, type CompileQueryModelContext } from './compile-query-model-schema.js';

function isQueryModel(ref: ModelRef): boolean {
  return ref.modelKey.startsWith('query-');
}

export function compileModelSchema(ref: ModelRef, context?: CompileQueryModelContext): Record<string, unknown> {
  // Query models use dedicated compiler for their own schema
  let ownSchema: Record<string, unknown>;
  if (isQueryModel(ref)) {
    ownSchema = compileQueryModelSchema(ref, context);
  } else {
    const parentRefs = ref.inherits ?? [];
    const inheritedFieldNames = new Set(parentRefs.flatMap((inherit) => inherit.fields ?? []));

    // Filter to only own fields (not inherited)
    const ownFields = Object.fromEntries(Object.entries(ref.fields ?? {}).filter(([key]) => !inheritedFieldNames.has(key)));

    ownSchema = {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(ownFields).map(([key, fieldRef]) => [key, compileModelFieldRef(fieldRef, ref.sourceFields?.[key])]),
      ),
    };

    const required = getRequiredFields(ref, ownFields);

    if (required.length > 0) {
      ownSchema.required = required;
    }
  }

  // Apply inheritance wrapping for all models (including query models)
  const parentRefs = ref.inherits ?? [];
  if (parentRefs.length > 0) {
    const schema = {
      allOf: [...parentRefs.map((inherit) => ({ $ref: inherit.modelRef.openapiRef ?? `#pending/${inherit.modelRef.id}` })), ownSchema],
    };

    if (ref.meta) {
      const codegenMeta = toCodegenMetadata(ref, ref.modelKey, parentRefs);
      const result = applyCodegenMetadata(schema, codegenMeta);
      return result;
    }

    return schema;
  }

  // Otherwise, emit normal object
  if (ref.meta) {
    const codegenMeta = toCodegenMetadata(ref, ref.modelKey);
    const result = applyCodegenMetadata(ownSchema, codegenMeta);
    return result;
  }

  return ownSchema;
}

function compileModelFieldRef(fieldRef: unknown, sourceField?: SchemaField): unknown {
  if (isRefUsage(fieldRef)) {
    // For RefUsage (array, nullable, extendWith), compile as a ref field
    const refField: SchemaField = {
      kind: SchemaKind.ref,
      ref: fieldRef as any,
      required: sourceField?.required,
      nullable: sourceField?.nullable,
      description: sourceField?.description,
    };
    return compilePropertySchema(refField);
  }

  if (isPropertyRef(fieldRef)) {
    // For plain PropertyRef, use pending ref that will be resolved later
    return { $ref: `#pending/${fieldRef.targetRefId ?? fieldRef.id}` };
  }

  throw new Error('Model fields must be property refs or ref usages.');
}

function getRequiredFields(ref: ModelRef, ownFields: Record<string, unknown>): string[] {
  // These variants never emit required fields
  const noRequiredModels = [
    'partial-model',
    'public-partial-model',
    'private-partial-model',
    'internal-partial-model',
    'system-partial-model',
    'query-exact',
    'query-search',
    'query-exact-search',
    'query-range',
    'query-in',
    'query-exists',
    'query-sort',
    'query-select',
  ];

  if (noRequiredModels.includes(ref.modelKey)) {
    return [];
  }

  return Object.entries(ref.sourceFields ?? {})
    .filter(([key, field]) => {
      // Only mark required if the field exists in ownFields
      if (!(key in ownFields)) return false;

      // Check if field is a RefUsage with optional/required metadata
      if (field && typeof field === 'object' && 'usage' in field) {
        const usage = (field as { usage?: { optional?: boolean; required?: boolean } }).usage;
        if (usage?.optional === true) return false;
        if (usage?.required === false) return false;
      }

      // Check field-level required property
      if (!field || !('required' in field)) return true;
      if (field.required === undefined) return true;

      return field.required === true;
    })
    .map(([key]) => key);
}

function queryBehaviorFromModelKey(modelKey: string): string | undefined {
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
      return undefined;
  }
}

function modelVariantFromModelKey(modelKey: string): string | undefined {
  switch (modelKey) {
    case 'model':
      return 'default';
    case 'public-model':
      return 'public';
    case 'partial-model':
      return 'partial';
    case 'selected-model':
      return 'selected';
    case 'abstract-model':
      return 'abstract';
    default:
      return undefined;
  }
}

function inferEntityNameFromModelRef(ref: ModelRef): string | undefined {
  // Extract entity from modelRef.name (e.g., "User.query-search" -> "User")
  if (ref.name) {
    const parts = ref.name.split('.');
    if (parts.length > 0) {
      return parts[0];
    }
  }
  return undefined;
}

function toCodegenMetadata(ref: ModelRef, modelKey?: string, parentRefs?: ModelRef['inherits']): CodegenMetadata {
  const queryBehavior = modelKey ? queryBehaviorFromModelKey(modelKey) : undefined;

  // Query models first
  if (queryBehavior) {
    const inherits =
      parentRefs && parentRefs.length > 0
        ? parentRefs.map((p) => ({ $ref: p.modelRef.openapiRef ?? `#pending/${p.modelRef.id}` }))
        : undefined;

    return {
      kind: 'query',
      resource: ref.meta?.resource,
      group: ref.meta?.group,
      entity: inferEntityNameFromModelRef(ref),
      behavior: queryBehavior,
      refId: ref.id,
      inherits,
    };
  }

  // Normal models fallback
  const inherits =
    parentRefs && parentRefs.length > 0
      ? parentRefs.map((p) => ({ $ref: p.modelRef.openapiRef ?? `#pending/${p.modelRef.id}` }))
      : undefined;

  return {
    kind: 'model',
    resource: ref.meta?.resource,
    group: ref.meta?.group,
    entity: inferEntityNameFromModelRef(ref),
    model: modelKey ? modelVariantFromModelKey(modelKey) : undefined,
    refId: ref.id,
    abstract: ref.abstract === true ? true : undefined,
    shared: ref.meta?.shared ? true : undefined,
    inherits,
  };
}
