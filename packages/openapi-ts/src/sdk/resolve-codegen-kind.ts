import type { CodegenKind, CodegenMetadata } from './codegen-extension.types.js';

/**
 * Resolves the correct x-codegen.kind based on actual schema shape.
 * Actual schema shape takes priority over intended usage metadata.
 *
 * Priority rules:
 * 1. schema has enum -> kind: enum
 * 2. schema type is string + enum -> kind: enum
 * 3. schema type is array/items enum -> keep parent object/query, but item schema/ref must be enum
 * 4. schema type is object -> kind: model or query
 * 5. schema allOf object composition -> kind: model or query
 * 6. scalar schema -> kind: property / primitive_alias
 * 7. unknown/non-object/non-enum -> never mark as model
 */
export function resolveCodegenKind(schema: Record<string, unknown>, requestedKind?: CodegenKind): CodegenKind {
  // Rule 1 & 2: schema has enum or is string with enum
  if (schema.enum && Array.isArray(schema.enum)) {
    return 'enum';
  }

  // Rule 3: array with enum items - the array itself is not an enum, but check if it's a property
  if (schema.type === 'array' && schema.items && typeof schema.items === 'object') {
    const items = schema.items as Record<string, unknown>;
    if (items.enum && Array.isArray(items.enum)) {
      // Array of enum values - this is a property, not an enum itself
      return requestedKind === 'query' ? 'query' : 'property';
    }
  }

  // Rule 4: object type
  if (schema.type === 'object' || schema.properties) {
    // For query models, keep the requested 'query' kind
    if (requestedKind === 'query') {
      return 'query';
    }
    // Otherwise, it's a model
    return 'model';
  }

  // Rule 5: allOf composition (object composition)
  if (schema.allOf && Array.isArray(schema.allOf)) {
    if (requestedKind === 'query') {
      return 'query';
    }
    return 'model';
  }

  // Rule 6: scalar schemas
  if (schema.type === 'string' || schema.type === 'number' || schema.type === 'integer' || schema.type === 'boolean') {
    return 'property';
  }

  // Rule 7: unknown - return requested kind if provided, otherwise undefined
  return requestedKind ?? 'property';
}

/**
 * Checks if a schema is an enum schema based on its shape.
 */
export function isEnumSchema(schema: Record<string, unknown>): boolean {
  return resolveCodegenKind(schema) === 'enum';
}

/**
 * Checks if a schema is an object schema (model or query).
 */
export function isObjectSchema(schema: Record<string, unknown>): boolean {
  const kind = resolveCodegenKind(schema);
  return kind === 'model' || kind === 'query';
}

/**
 * Strips invalid inheritance metadata from enum schemas.
 * Enum schemas should not have model inheritance metadata.
 */
export function stripEnumInheritanceMetadata(metadata: Record<string, unknown> | CodegenMetadata): Record<string, unknown> {
  const { inherits, ...rest } = metadata as Record<string, unknown>;
  return rest;
}
