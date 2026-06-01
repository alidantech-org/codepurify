// src/compiler/passes/08-resources.ts

import type { ResourceAuthoringState } from '@/contract/types/authoring/6.resource-builder';

import type { ResourceDefinition } from '@/contract/types/ir/resource/definition';
import type { RoutesDefinition } from '@/contract/types/ir/resource/route/definition';

import type { CompilerContext } from '../context/compiler-context';

import { resolveRoute } from '../resolvers/route-resolver';

import { securityPolicyRef } from '../resolvers/ref-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// RESOURCE DEFAULTS
// ============================================================================

/**
 * Resolves resource default security into an IR security policy ref.
 */
function resolveResourceDefaultSecurity(
  security: ResourceAuthoringState['defaults']['security'],
): ResourceDefinition['defaults']['security'] {
  if (security === undefined) return undefined;

  if (typeof security === 'object' && 'key' in security && typeof security.key === 'string') {
    return securityPolicyRef(toSnakeCaseKey(security.key));
  }

  return undefined;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Creates a route path map grouped by URL path and HTTP method.
 */
function resolveResourceRoutes(
  ctx: CompilerContext,
  resourceKey: string,
  resource: ResourceAuthoringState,
): {
  readonly operations: ResourceDefinition['operations'];
  readonly routes: RoutesDefinition;
} {
  const operations: ResourceDefinition['operations'] = {};
  const routes: RoutesDefinition = {};

  for (const [routeKey, route] of Object.entries(resource.routes ?? {})) {
    const resolved = resolveRoute({
      ctx,
      resourceKey,
      routeKey,
      route,
    });

    operations[resolved.operationKey] = resolved.operation;

    routes[route.path] ??= {};
    routes[route.path][route.method] = resolved.method;
  }

  return {
    operations,
    routes,
  };
}

// ============================================================================
// RESOURCE
// ============================================================================

/**
 * Compiles one authoring resource into an IR resource.
 */
function resolveResource(ctx: CompilerContext, key: string, resource: ResourceAuthoringState): ResourceDefinition {
  const compiledKey = toSnakeCaseKey(key);
  const resolvedRoutes = resolveResourceRoutes(ctx, compiledKey, resource);

  return {
    ...(resource.description !== undefined ? { description: resource.description } : {}),
    ...(resource.deprecated !== undefined ? { deprecated: resource.deprecated } : {}),
    ...(resource.meta !== undefined ? { meta: resource.meta } : {}),

    base_path: `/${compiledKey}`,
    folders: [...resource.folders],

    defaults: {
      ...(resource.defaults.security !== undefined ? { security: resolveResourceDefaultSecurity(resource.defaults.security) } : {}),
    },

    operations: resolvedRoutes.operations,
    routes: resolvedRoutes.routes,
  };
}

// ============================================================================
// PASS
// ============================================================================

/**
 * Compiles authoring resources into IR resources.
 *
 * Operations are created here from routes. Authoring does not own operations.
 */
export function compileResources(ctx: CompilerContext): void {
  for (const [key, resource] of Object.entries(ctx.authoring.resources ?? {})) {
    ctx.ir.resources[toSnakeCaseKey(key)] = resolveResource(ctx, key, resource);
  }
}
