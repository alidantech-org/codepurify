import type { RouteRegistry, RouteParameterRegistry, RouteParameterFieldValue } from '../routes/route.types.js';
import { validateRouteSchema } from './validate-route-schema.js';
import type { ValidationIssue } from './validation-result.types.js';
import { isPropertyRef } from './ref-guards.js';
import { isRefUsage } from './ref-usage-guards.js';

export function validateRoutes(registry: RouteRegistry): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Validate top-level path parameters
  if (registry.parameters) {
    for (const [key, paramRef] of Object.entries(registry.parameters)) {
      // Reject path-pattern keys
      if (key.startsWith('/')) {
        issues.push({
          path: `parameters.${key}`,
          message: `defineRoutes.parameters must be keyed by parameter name, not path pattern. Use { ${key.replace('/:', '')}: ref } instead of { ${key}: ref }.`,
        });
        continue;
      }

      // Validate parameter name format
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        issues.push({
          path: `parameters.${key}`,
          message: `Parameter name "${key}" must be a valid identifier (start with letter or underscore, followed by letters, numbers, or underscores).`,
        });
        continue;
      }

      // Validate parameter value is PropertyRef or RefUsage<PropertyRef>
      if (!isPropertyRef(paramRef) && !(isRefUsage(paramRef) && isPropertyRef(paramRef.ref))) {
        issues.push({
          path: `parameters.${key}`,
          message: `Parameter value must be a PropertyRef or RefUsage<PropertyRef>. Got: ${typeof paramRef === 'object' && 'kind' in paramRef ? (paramRef as { kind: string }).kind : typeof paramRef}`,
        });
      }
    }
  }

  for (const [key, route] of Object.entries(registry.routes)) {
    const basePath = `routes.${key}`;

    issues.push(...validateRouteSchema(route.params, `${basePath}.params`));
    issues.push(...validateRouteSchema(route.query, `${basePath}.query`));
    issues.push(...validateRouteSchema(route.body, `${basePath}.body`));
    issues.push(...validateRouteSchema(route.response, `${basePath}.response`));

    for (const [status, response] of Object.entries(route.responses ?? {})) {
      issues.push(...validateRouteSchema(response, `${basePath}.responses.${status}`));
    }
  }

  return issues;
}
