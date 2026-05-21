import { SchemaKind } from '../../schema/schema-kind.js';
import type { CompositeSchemaField, PrimitiveSchemaField, SchemaField } from '../../schema/schema.types.js';
import type { PropertyRef } from '../../refs/ref.types.js';
import { isRefUsage, getRefRequired, getRefNullable } from '../../validation/ref-usage-guards.js';
import { zodToOpenApiSchema, type ZodSchemaMode } from './zod-to-openapi-schema.js';

export function compilePropertySchema(field: SchemaField, mode: ZodSchemaMode = 'output'): unknown {
  if (isRefUsage(field)) {
    return applyNullable({ $ref: `#pending/${field.ref.id}` }, getRefNullable(field));
  }

  if (isPropertyRef(field)) {
    return {
      $ref: `#pending/${field.id}`,
    };
  }

  if (field.kind === SchemaKind.primitive) {
    return compilePrimitive(field, mode);
  }

  return compileComposite(field, mode);
}

function compilePrimitive(field: PrimitiveSchemaField, mode: ZodSchemaMode): unknown {
  return applyNullable(
    {
      ...asObject(zodToOpenApiSchema(field.zod, mode)),
      description: field.description,
    },
    field.nullable,
  );
}

function compileComposite(field: CompositeSchemaField, mode: ZodSchemaMode): unknown {
  const required = getRequiredKeys(field.fields);

  const schema: Record<string, unknown> = {
    type: 'object',
    description: field.description,
    properties: Object.fromEntries(Object.entries(field.fields).map(([key, value]) => [key, compilePropertySchema(value, mode)])),
  };

  if (required.length > 0) {
    schema.required = required;
  }

  return applyNullable(schema, field.nullable);
}

function getRequiredKeys(fields: CompositeSchemaField['fields']): string[] {
  return Object.entries(fields)
    .filter(([, value]) => isRequired(value))
    .map(([key]) => key);
}

function isRequired(value: SchemaField): boolean {
  const required = getRefRequired(value);
  if (required !== undefined) return required;

  if (!isRefUsage(value) && 'required' in value && value.required !== undefined) {
    return value.required;
  }

  return true;
}

function applyNullable(schema: unknown, nullable: boolean | undefined): unknown {
  if (!nullable) return schema;

  return {
    anyOf: [schema, { type: 'null' }],
  };
}

function isPropertyRef(value: unknown): value is PropertyRef {
  return !!value && typeof value === 'object' && 'propertyKey' in value && 'id' in value;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}
