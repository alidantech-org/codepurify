import type { ComponentFieldMap, SchemaCompositionFieldValue } from '../../components/component.types.js';
import type { SchemaComponentDefinition } from '../../components/schemas/schema-component.types.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { applySdkExtensions } from '../../sdk/apply-sdk-extensions.js';

export function compileComponentSchema(definition: SchemaComponentDefinition, ref?: ComponentRef): Record<string, unknown> {
  const required = getRequiredKeys(definition.fields);

  const schema: Record<string, unknown> = {
    type: 'object',
    properties: compileComponentFields(definition.fields),
  };

  if (required.length > 0) {
    schema.required = required;
  }

  if (ref?.meta) {
    applySdkExtensions(schema, ref.meta);
  }

  return schema;
}

function compileComponentFields(fields: ComponentFieldMap): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, compileCompositionValue(value)]));
}

function compileCompositionValue(value: SchemaCompositionFieldValue): unknown {
  const ref = isRefUsage(value) ? value.ref : value;
  const array = isRefUsage(value) ? value.usage.array : false;
  const nullable = isRefUsage(value) ? value.usage.nullable : false;
  const extendWith = isRefUsage(value) ? value.usage.extendWith : undefined;

  let schema: unknown = { $ref: `#pending/${ref.id}` };

  // Apply extendWith
  if (extendWith) {
    const extendedProperties = compileComponentFields(extendWith);
    schema = {
      allOf: [
        schema,
        {
          type: 'object',
          properties: extendedProperties,
        },
      ],
    };
  }

  // Apply array
  if (array) {
    schema = { type: 'array', items: schema };
  }

  // Apply nullable
  if (nullable) {
    schema = {
      anyOf: [schema, { type: 'null' }],
    };
  }

  return schema;
}

function getRequiredKeys(fields: ComponentFieldMap): string[] {
  return Object.entries(fields)
    .filter(([, value]) => !isOptional(value))
    .map(([key]) => key);
}

function isOptional(value: SchemaCompositionFieldValue): boolean {
  if (!isRefUsage(value)) return false;
  return value.usage.required === false;
}
