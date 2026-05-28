
import { isRefUsage, getRefRequired, getRefNullable, getRefArray, getRefExtendWith } from '../../validation/ref-usage-guards.js';
import { zodToOpenApiSchema, type ZodSchemaMode } from './zod-to-openapi-schema.js';
import { normalizeExtendWithInput } from './normalize-extend-with.js';
import { SchemaKind } from '@/contract/schema/schema-kind.js';
import { SchemaField, PrimitiveSchemaField, CompositeSchemaField, RefSchemaField, SchemaCompositionFieldValue, RecordSchemaField, LiteralSchemaField, OneOfSchemaField, AnyOfSchemaField, FileSchemaField, NoContentSchemaField } from '@/contract/schema/schema.types.js';

export function compilePropertySchema(field: SchemaField, mode: ZodSchemaMode = 'output'): unknown {
  if (field.kind === SchemaKind.primitive) {
    return compilePrimitive(field, mode);
  }

  if (field.kind === SchemaKind.composite) {
    return compileComposite(field, mode);
  }

  if (field.kind === SchemaKind.ref) {
    return compileRef(field, mode);
  }

  if (field.kind === SchemaKind.record) {
    return compileRecord(field, mode);
  }

  if (field.kind === SchemaKind.literal) {
    return compileLiteral(field, mode);
  }

  if (field.kind === SchemaKind.oneOf) {
    return compileOneOf(field, mode);
  }

  if (field.kind === SchemaKind.anyOf) {
    return compileAnyOf(field, mode);
  }

  if (field.kind === SchemaKind.file) {
    return compileFile(field, mode);
  }

  if (field.kind === SchemaKind.noContent) {
    return compileNoContent(field, mode);
  }

  throw new Error(`Unknown schema kind: ${(field as { kind: string }).kind}`);
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

function compileRef(field: RefSchemaField, mode: ZodSchemaMode): unknown {
  let schema: Record<string, unknown>;
  const ref = isRefUsage(field.ref) ? field.ref.ref : field.ref;
  const refUsage = isRefUsage(field.ref) ? field.ref : undefined;

  // Step 1: Resolve base ref to OpenAPI $ref
  schema = { $ref: `#pending/${ref.id}` };

  // Step 2: Apply extendWith
  const extendWith = refUsage ? getRefExtendWith(refUsage) : undefined;
  const normalizedExtendWith = normalizeExtendWithInput(extendWith);
  if (normalizedExtendWith && Object.keys(normalizedExtendWith).length > 0) {
    const entries = Object.entries(normalizedExtendWith) as Array<[string, SchemaCompositionFieldValue]>;
    schema = {
      allOf: [
        schema,
        {
          type: 'object',
          properties: Object.fromEntries(entries.map(([key, value]) => [key, compilePropertySchema(wrapAsRefSchemaField(value), mode)])),
        },
      ],
    };
  }

  // Step 3: Apply array
  const isArray = refUsage ? getRefArray(refUsage) : false;
  if (isArray) {
    schema = {
      type: 'array',
      items: schema,
    };
  }

  // Step 4: Apply nullable from usage
  if (refUsage && getRefNullable(refUsage)) {
    const schemaObj = asObject(schema);
    // For OpenAPI 3.1, use type arrays for simple nullable primitives
    if (schemaObj.type && typeof schemaObj.type === 'string') {
      const primitiveTypes = ['string', 'number', 'integer', 'boolean'];
      if (primitiveTypes.includes(schemaObj.type)) {
        const { type, ...rest } = schemaObj;
        schema = {
          ...rest,
          type: [type, 'null'],
        };
      } else {
        schema = {
          anyOf: [schema, { type: 'null' }],
        };
      }
    } else {
      schema = {
        anyOf: [schema, { type: 'null' }],
      };
    }
  }

  // Step 5: Apply description from field options
  if (field.description) {
    schema.description = field.description;
  }

  // Step 6: Apply nullable from field options (outer wrapper)
  return applyNullable(schema, field.nullable);
}

function wrapAsRefSchemaField(ref: SchemaCompositionFieldValue): RefSchemaField {
  return {
    kind: SchemaKind.ref,
    ref: ref as RefSchemaField['ref'],
  };
}

function compileRecord(field: RecordSchemaField, mode: ZodSchemaMode): unknown {
  return applyNullable(
    {
      type: 'object',
      additionalProperties: compilePropertySchema(field.value, mode),
      description: field.description,
    },
    field.nullable,
  );
}

function compileLiteral(field: LiteralSchemaField, mode: ZodSchemaMode): unknown {
  const schema: Record<string, unknown> = {
    const: field.value,
    description: field.description,
  };

  if (field.value === null) {
    schema.type = 'null';
  } else if (typeof field.value === 'string') {
    schema.type = 'string';
  } else if (typeof field.value === 'number') {
    schema.type = Number.isInteger(field.value) ? 'integer' : 'number';
  } else if (typeof field.value === 'boolean') {
    schema.type = 'boolean';
  }

  return applyNullable(schema, field.nullable);
}

function compileOneOf(field: OneOfSchemaField, mode: ZodSchemaMode): unknown {
  return applyNullable(
    {
      oneOf: field.values.map((value) => compilePropertySchema(value, mode)),
      description: field.description,
    },
    field.nullable,
  );
}

function compileAnyOf(field: AnyOfSchemaField, mode: ZodSchemaMode): unknown {
  return applyNullable(
    {
      anyOf: field.values.map((value) => compilePropertySchema(value, mode)),
      description: field.description,
    },
    field.nullable,
  );
}

function compileFile(field: FileSchemaField, mode: ZodSchemaMode): unknown {
  return applyNullable(
    {
      type: 'string',
      format: 'binary',
      description: field.description,
    },
    field.nullable,
  );
}

function compileNoContent(field: NoContentSchemaField, mode: ZodSchemaMode): unknown {
  return applyNullable(
    {
      description: field.description,
    },
    field.nullable,
  );
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

  const schemaObj = asObject(schema);

  // For OpenAPI 3.1, use type arrays for simple nullable primitives
  // This is cleaner and avoids classification issues
  if (schemaObj.type && typeof schemaObj.type === 'string') {
    const primitiveTypes = ['string', 'number', 'integer', 'boolean'];
    if (primitiveTypes.includes(schemaObj.type)) {
      const { type, ...rest } = schemaObj;
      return {
        ...rest,
        type: [type, 'null'],
      };
    }
  }

  // For complex schemas, use anyOf
  return {
    anyOf: [schema, { type: 'null' }],
  };
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}
