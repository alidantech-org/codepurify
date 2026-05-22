import type { ModelRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applySdkExtensions } from '../../sdk/apply-sdk-extensions.js';
import { compilePropertySchema } from './compile-property-schema.js';

export function compileModelSchema(ref: ModelRef): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: 'object',
    properties: Object.fromEntries(Object.entries(ref.sourceFields ?? {}).map(([key, field]) => [key, compilePropertySchema(field)])),
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

  return schema;
}

function getRequiredFields(ref: ModelRef): string[] {
  if (ref.modelKey === 'partial-model') return [];

  return Object.keys(ref.sourceFields ?? {}).filter((key) => {
    const field = ref.sourceFields?.[key];

    if (!field || !('required' in field)) return true;
    if (field.required === undefined) return true;

    return field.required;
  });
}
