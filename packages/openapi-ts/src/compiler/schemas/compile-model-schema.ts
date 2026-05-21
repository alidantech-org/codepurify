import type { ModelRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { applySdkExtensions } from '../../sdk/apply-sdk-extensions.js';

export function compileModelSchema(ref: ModelRef): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(ref.fields).map(([key, fieldRef]) => [
        key,
        applyNullable({ $ref: `#pending/${fieldRef.id}` }, getFieldNullable(ref.sourceFields?.[key])),
      ]),
    ),
  };

  const required = getRequiredFields(ref);

  if (required.length > 0) {
    schema.required = required;
  }

  if (ref.meta) {
    applySdkExtensions(schema, ref.meta);
  }

  return schema;
}

function getRequiredFields(ref: ModelRef): string[] {
  if (ref.modelKey === 'partial-model') return [];

  return Object.keys(ref.fields).filter((key) => {
    const field = ref.sourceFields?.[key];

    if (!field || !('required' in field)) return true;
    if (field.required === undefined) return true;

    return field.required;
  });
}

function getFieldNullable(field: SchemaField | undefined): boolean {
  if (!field || !('nullable' in field)) return false;

  return field.nullable === true;
}

function applyNullable(schema: unknown, nullable: boolean): unknown {
  if (!nullable) return schema;

  return {
    anyOf: [schema, { type: 'null' }],
  };
}
