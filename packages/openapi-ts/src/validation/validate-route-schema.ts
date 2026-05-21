import type { RouteParameterRef, RouteRequestBodyRef, RouteResponseRef, RouteSchemaRef } from '../routes/route.types.js';
import { isEngineRef } from './ref-guards.js';
import { isRefUsage } from './ref-usage-guards.js';
import { validateComponentFields } from './validate-component-fields.js';
import type { ValidationIssue } from './validation-result.types.js';

export type ValidatableRouteSchema = RouteSchemaRef | RouteParameterRef | RouteRequestBodyRef | RouteResponseRef | readonly unknown[];

export function validateRouteSchema(schema: ValidatableRouteSchema | undefined, path: string): ValidationIssue[] {
  if (!schema) return [];

  if (Array.isArray(schema)) {
    return schema.flatMap((item, index) => validateRouteSchema(item as ValidatableRouteSchema, `${path}.${index}`));
  }

  if (isEngineRef(schema) || isRefUsage(schema)) return [];

  return validateComponentFields(schema as Parameters<typeof validateComponentFields>[0], path);
}
