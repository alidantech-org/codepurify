import type { VersionContract } from "../version/version-contract.types.js";
import { validateComponentFields } from "./validate-component-fields.js";
import { validateDuplicates } from "./validate-duplicates.js";
import { validateRoutes } from "./validate-routes.js";
import type { ValidationIssue } from "./validation-result.types.js";

export function validateVersionContract(
  contract: VersionContract,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  issues.push(...validateDuplicates(contract));

  for (const registry of contract.components) {
    for (const component of registry.definitions) {
      issues.push(
        ...validateComponentFields(
          component.fields,
          `components.${component.name}`,
        ),
      );
    }
  }

  for (const resource of contract.resources) {
    for (const registry of resource.components) {
      for (const component of registry.definitions) {
        issues.push(
          ...validateComponentFields(
            component.fields,
            `resources.${resource.context.key}.components.${component.name}`,
          ),
        );
      }
    }

    for (const routes of resource.routes) {
      issues.push(...validateRoutes(routes));
    }
  }

  return issues;
}
