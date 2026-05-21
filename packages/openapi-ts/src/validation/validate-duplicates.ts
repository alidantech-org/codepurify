import type { VersionContract } from "../version/version-contract.types.js";
import type { ValidationIssue } from "./validation-result.types.js";

export function validateDuplicates(
  contract: VersionContract,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  issues.push(
    ...findDuplicates(
      contract.resources.map((resource) => resource.context.key),
      "resources",
    ),
  );

  issues.push(
    ...findRegistryDuplicates(
      contract.properties.map((registry) => registry.name),
      "properties",
    ),
  );

  issues.push(
    ...findRegistryDuplicates(
      contract.components.map((registry) => registry.name),
      "components",
    ),
  );

  for (const resource of contract.resources) {
    const basePath = `resources.${resource.context.key}`;

    issues.push(
      ...findRegistryDuplicates(
        resource.properties.map((registry) => registry.name),
        `${basePath}.properties`,
      ),
    );

    issues.push(
      ...findRegistryDuplicates(
        resource.components.map((registry) => registry.name),
        `${basePath}.components`,
      ),
    );

    issues.push(
      ...findRegistryDuplicates(
        resource.routes.map((registry) => registry.name),
        `${basePath}.routes`,
      ),
    );
  }

  return issues;
}

function findRegistryDuplicates(
  names: string[],
  path: string,
): ValidationIssue[] {
  return findDuplicates(names, path);
}

function findDuplicates(names: string[], path: string): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];

  for (const name of names) {
    if (!seen.has(name)) {
      seen.add(name);
      continue;
    }

    issues.push({
      path,
      message: `Duplicate name found: ${name}`,
    });
  }

  return issues;
}
