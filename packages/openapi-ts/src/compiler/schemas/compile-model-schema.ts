import type { ModelRef, PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applySdkExtensions } from '../../sdk/apply-sdk-extensions.js';
import { compilePropertySchema } from './compile-property-schema.js';
import { toOpenApiSchemaRef } from '../refs/to-openapi-ref.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { SchemaKind } from '../../schema/schema-kind.js';

export function compileModelSchema(ref: ModelRef): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(ref.fields ?? {}).map(([key, fieldRef]) => [key, compileModelFieldRef(fieldRef, ref.sourceFields?.[key])]),
    ),
  };

  const required = getRequiredFields(ref);

  if (required.length > 0) {
    schema.required = required;
  }

  if (ref.meta) {
    applySdkExtensions(schema, ref.meta);
  }

  if (ref.inherits && ref.inherits.length > 0) {
    schema['x-sdk-inherits'] = ref.inherits;
  }

  if (ref.abstract) {
    schema['x-sdk-abstract'] = true;
  }

  // Add query model metadata
  if (ref.modelKey?.startsWith('query-')) {
    const queryType = ref.modelKey.replace('query-', '');
    schema['x-sdk-query-model'] = queryType;
    if (ref.meta?.resource) {
      schema['x-sdk-resource'] = ref.meta.resource;
    }
  }

  return schema;
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

function getRequiredFields(ref: ModelRef): string[] {
  if (ref.modelKey === 'partial-model') return [];

  return Object.entries(ref.sourceFields ?? {})
    .filter(([key, field]) => {
      // Only mark required if the field exists in modelRef.fields
      if (!(key in (ref.fields ?? {}))) return false;

      if (!field || !('required' in field)) return true;
      if (field.required === undefined) return true;

      return field.required;
    })
    .map(([key]) => key);
}
