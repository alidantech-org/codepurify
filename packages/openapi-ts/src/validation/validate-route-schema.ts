import type { ComponentFieldMap } from "../components/component.types.js";
import type { RouteSchemaRef } from "../routes/route.types.js";
import { isComponentRef, isEngineRef } from "./ref-guards.js";
import { isRefUsage } from "./ref-usage-guards.js";
import { validateComponentFields } from "./validate-component-fields.js";
import type { ValidationIssue } from "./validation-result.types.js";

export function validateRouteSchema(
  schema: RouteSchemaRef | undefined,
  path: string,
): ValidationIssue[] {
  if (!schema) return [];

  if (isComponentRef(schema)) return [];

  if (isEngineRef(schema) || isRefUsage(schema)) return [];

  return validateComponentFields(schema as ComponentFieldMap, path);
}
