import type { ComponentFieldMap } from '../../components/component.types.js';
import type { RouteParameterRef } from '../../routes/route.types.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ParameterRef } from '../../refs/ref.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { toParameterOpenApiRef } from '../refs/to-component-bucket-ref.js';
import { compileRouteSchema } from './compile-route-schema.js';

export function compileRouteParameters(
  schema: RouteParameterRef | readonly ParameterRef[] | undefined,
  location: 'path' | 'query',
  resolver: RefResolver,
): unknown[] {
  if (!schema) return [];

  if (Array.isArray(schema)) {
    return schema.map((ref) => toParameterOpenApiRef(ref, resolver));
  }

  if (isParameterRef(schema)) {
    return [toParameterOpenApiRef(schema, resolver)];
  }

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

function unwrapObjectSchema(value: unknown): { properties?: Record<string, unknown>; required?: string[] } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  if ('properties' in value) return value as { properties?: Record<string, unknown>; required?: string[] };
  return undefined;
}

function isRequired(name: string, required: string[] | undefined): boolean {
  return required?.includes(name) ?? false;
}

function isParameterRef(value: unknown): value is ParameterRef {
  return !!value && typeof value === 'object' && 'kind' in value && value.kind === RefKind.parameter;
}
