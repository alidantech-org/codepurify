import type { ComponentFieldMap, SchemaCompositionFieldValue } from '../../components/component.types.js';
import type { SchemaComponentDefinition } from '../../components/schemas/schema-component.types.js';
import type { ComponentRef, PropertyRef, ModelRef } from '../../refs/ref.types.js';
import type { ArrayRef, ExtendedRef } from '../../refs/ref-wrapper.types.js';
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
  let ref = isRefUsage(value) ? value.ref : value;
  let array = isRefUsage(value) ? value.usage.array : false;
  const nullable = isRefUsage(value) ? value.usage.nullable : false;
  let extendWith = isRefUsage(value) ? value.usage.extendWith : undefined;

  // Unwrap ArrayRef and ExtendedRef
  if ('kind' in ref) {
    if (ref.kind === 'array-ref') {
      ref = (ref as ArrayRef).ref as unknown as ComponentRef | PropertyRef | ModelRef;
      array = true;
    } else if (ref.kind === 'extended-ref') {
      const extendedRef = ref as ExtendedRef;
      ref = extendedRef.ref as unknown as ComponentRef | PropertyRef | ModelRef;
      extendWith = extendedRef.fields;
    }
  }

  // Ensure ref is a base ref type (PropertyRef, ModelRef, ComponentRef)
  const baseRef = ref as ComponentRef | PropertyRef | ModelRef;
  let schema: unknown = { $ref: `#pending/${baseRef.id}` };

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
