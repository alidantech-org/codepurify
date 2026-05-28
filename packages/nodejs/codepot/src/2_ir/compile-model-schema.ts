import type { ModelRef, PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applyCodegenMetadata } from '../../codegen/apply-codegen-extensions.js';
import {
  XCodegenAccess,
  XCodegenDtoRole,
  XCodegenEntityVariant,
  XCodegenKind,
  type CodegenMetadata,
  type XCodegenEntityMeta,
} from '../../codegen/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';
import { toOpenApiSchemaRef } from '../refs/to-openapi-ref.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { SchemaKind } from '../../schema/schema-kind.js';
import { compileQueryModelSchema, type CompileQueryModelContext, type EnumComponentExtraction } from './compile-query-model-schema.js';

function isQueryModel(ref: ModelRef): boolean {
  return ref.modelKey === 'query-filter' || ref.modelKey === 'advanced-query-filter';
}

export function compileModelSchema(
  ref: ModelRef,
  context?: CompileQueryModelContext,
): { schema: Record<string, unknown>; enumComponents?: EnumComponentExtraction[] } {
  // Query-filter models use dedicated compiler and return immediately to avoid model metadata override
  if (isQueryModel(ref)) {
    return compileQueryModelSchema(ref, context);
  }

  // Normal model compilation
  let ownSchema: Record<string, unknown>;
  let enumComponents: EnumComponentExtraction[] | undefined;

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

  // Apply inheritance wrapping for all models (including query models)
  if (parentRefs.length > 0) {
    const schema = {
      allOf: [...parentRefs.map((inherit) => ({ $ref: inherit.modelRef.openapiRef ?? `#pending/${inherit.modelRef.id}` })), ownSchema],
    };

    if (ref.meta) {
      const codegenMeta = toCodegenMetadata(ref, ref.modelKey, parentRefs);
      const result = applyCodegenMetadata(schema, codegenMeta);
      return { schema: result, enumComponents };
    }

    return { schema, enumComponents };
  }

  // Otherwise, emit normal object
  if (ref.meta) {
    const codegenMeta = toCodegenMetadata(ref, ref.modelKey);
    const result = applyCodegenMetadata(ownSchema, codegenMeta);
    return { schema: result, enumComponents };
  }

  return { schema: ownSchema, enumComponents };
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
  const entityName = inferEntityNameFromModelRef(ref);

  // Preserve entity metadata from ref.meta, only override variant if needed
  const entityMeta: XCodegenEntityMeta | undefined = entityName
    ? {
        name: entityName,
        variant: ref.meta?.entity?.variant ?? (modelKey?.includes('partial') ? XCodegenEntityVariant.partial : XCodegenEntityVariant.full),
        access: ref.meta?.entity?.access ?? XCodegenAccess.default,
      }
    : undefined;

  const inherits =
    parentRefs && parentRefs.length > 0
      ? parentRefs.map((p) => ({ $ref: p.modelRef.openapiRef ?? `#pending/${p.modelRef.id}` }))
      : undefined;

  // Query models first
  if (queryBehavior) {
    return {
      kind: XCodegenKind.dto,
      role: XCodegenDtoRole.query,
      resource: ref.meta?.resource,
      entity: entityMeta,
      inherits,
    };
  }

  // Normal models fallback
  return {
    kind: XCodegenKind.model,
    resource: ref.meta?.resource,
    entity: entityMeta,
    abstract: ref.abstract === true ? true : undefined,
    ...(ref.meta?.shared ? { shared: true } : {}),
    inherits,
  };
}
