import type { ComponentFieldMap } from '../../components/component.types.js';
import type { RouteParameterRef, RouteParameterMap, RouteParameterFieldValue } from '../../routes/route.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { compileRouteSchema } from './compile-route-schema.js';
import { isRefUsage, getRefRequired } from '../../validation/ref-usage-guards.js';

export function compileRouteParameters(
  schema: RouteParameterRef | RouteParameterMap | undefined,
  location: 'path' | 'query',
  resolver: RefResolver,
): unknown[] {
  if (!schema) return [];

  // Handle RouteParameterMap (new type)
  if (isParameterMap(schema)) {
    return Object.entries(schema).map(([name, param]) => ({
      name,
      in: location,
      required: location === 'path' ? true : !isOptional(param),
      schema: compileParameterField(param, resolver),
    }));
  }

  // Legacy ComponentFieldMap handling
  const compiled = compileRouteSchema(schema as ComponentFieldMap, resolver);
  const objectSchema = unwrapObjectSchema(compiled);

  if (!objectSchema?.properties) return [];

  return Object.entries(objectSchema.properties).map(([name, property]) => ({
    name,
    in: location,
    required: location === 'path' ? true : isRequired(name, objectSchema.required),
    schema: property,
  }));
}

function compileParameterField(param: RouteParameterFieldValue, resolver: RefResolver): unknown {
  const ref = isRefUsage(param) ? param.ref : param;
  const nullable = isRefUsage(param) ? param.nullable : undefined;

  const schema = { $ref: `#pending/${ref.id}` };

  if (nullable) {
    return {
      anyOf: [schema, { type: 'null' }],
    };
  }

  return schema;
}

function isOptional(param: RouteParameterFieldValue): boolean {
  const required = isRefUsage(param) ? getRefRequired(param) : undefined;
  return required === false;
}

function isParameterMap(value: unknown): value is RouteParameterMap {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !('schema' in value) && !('kind' in value);
}

function unwrapObjectSchema(value: unknown): { properties?: Record<string, unknown>; required?: string[] } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  if ('properties' in value) return value as { properties?: Record<string, unknown>; required?: string[] };
  return undefined;
}

function isRequired(name: string, required: string[] | undefined): boolean {
  return required?.includes(name) ?? false;
}
