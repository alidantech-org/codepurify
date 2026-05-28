import { validateSchemaComponentValue } from './validate-component-fields';
import { validateDuplicates } from './validate-duplicates';
import { validateRoutes } from './validate-routes';
import type { ValidationIssue } from './validation-result.types';
import { VersionContract } from '@/contract/version/version-contract.types';

export function validateVersionContract(contract: VersionContract): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  issues.push(...validateDuplicates(contract));

  for (const registry of contract.schemaComponents) {
    for (const component of registry.definitions) {
      issues.push(...validateSchemaComponentValue(component.value, `components.${component.name}`));
    }
  }

  for (const resource of contract.resources) {
    for (const registry of resource.schemaComponents) {
      for (const component of registry.definitions) {
        issues.push(...validateSchemaComponentValue(component.value, `resources.${resource.context.key}.components.${component.name}`));
      }
    }

    for (const routes of resource.routes) {
      issues.push(...validateRoutes(routes));
    }
  }

  return issues;
}
