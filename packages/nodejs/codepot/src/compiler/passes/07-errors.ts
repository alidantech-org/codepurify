// src/compiler/passes/07-errors.ts

import type { CompilerContext } from '../context/compiler-context';

import { getErrorsState, resolveErrorResponse } from '../resolvers/error-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// GLOBAL ERRORS
// ============================================================================

/**
 * Compiles version-level/global errors into IR responses.errors.
 */
function compileGlobalErrors(ctx: CompilerContext): void {
  const errors = getErrorsState(ctx.authoring.errors);

  for (const [key, error] of Object.entries(errors)) {
    ctx.ir.responses.errors[toSnakeCaseKey(key)] = resolveErrorResponse({
      ctx,
      key,
      error,
    });
  }
}

// ============================================================================
// RESOURCE ERRORS
// ============================================================================

/**
 * Creates a stable compiled key for resource-scoped errors.
 */
function createResourceErrorKey(resourceKey: string, errorKey: string): string {
  return toSnakeCaseKey(`${resourceKey}_${errorKey}`);
}

/**
 * Compiles resource-scoped errors into the same top-level IR responses.errors
 * registry.
 *
 * Resource errors do not remain nested under resources in IR.
 */
function compileResourceErrors(ctx: CompilerContext): void {
  for (const [resourceKey, resource] of Object.entries(ctx.authoring.resources ?? {})) {
    const errors = getErrorsState(resource.errors);

    for (const [errorKey, error] of Object.entries(errors)) {
      const compiledKey = createResourceErrorKey(resourceKey, errorKey);

      ctx.ir.responses.errors[compiledKey] = resolveErrorResponse({
        ctx,
        key: compiledKey,
        error,
      });
    }
  }
}

// ============================================================================
// PASS
// ============================================================================

/**
 * Compiles all authoring errors into top-level IR responses.errors.
 */
export function compileErrors(ctx: CompilerContext): void {
  compileGlobalErrors(ctx);
  compileResourceErrors(ctx);
}
