import type { ComponentFieldMap } from "../components/component.types.js";
import { isComponentRef, isPropertyRef } from "./ref-guards";
import type { ValidationIssue } from "./validation-result.types.js";

export function validateComponentFields(
  fields: ComponentFieldMap,
  path = "component.fields",
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of Object.entries(fields)) {
    const currentPath = `${path}.${key}`;

    if (isPropertyRef(value) || isComponentRef(value)) continue;

    if (isPlainObject(value)) {
      issues.push(...validateComponentFields(value, currentPath));
      continue;
    }

    issues.push({
      path: currentPath,
      message:
        "Component fields must resolve to property refs, component refs, or nested ref objects.",
    });
  }

  return issues;
}

function isPlainObject(value: unknown): value is ComponentFieldMap {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
