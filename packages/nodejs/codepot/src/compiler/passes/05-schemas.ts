// src/compiler/passes/05-schemas.ts

import type { CompilerContext } from '../context/compiler-context';

import { resolveDto, resolveParams } from '../resolvers/dto-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// DTOS
// ============================================================================

/**
 * Compiles authoring DTO schemas into IR DTO schemas.
 */
function compileDtos(ctx: CompilerContext): void {
  for (const [key, dto] of Object.entries(ctx.authoring.schemas.dtos ?? {})) {
    ctx.ir.schemas.dtos[toSnakeCaseKey(key)] = resolveDto({
      key,
      dto,
    });
  }
}

// ============================================================================
// PARAMS
// ============================================================================

/**
 * Compiles authoring params into IR params schemas.
 */
function compileParams(ctx: CompilerContext): void {
  for (const [key, ref] of Object.entries(ctx.authoring.schemas.params ?? {})) {
    ctx.ir.schemas.params[toSnakeCaseKey(key)] = resolveParams({
      key,
      ref,
    }).ref;
  }
}

// ============================================================================
// PASS
// ============================================================================

/**
 * Compiles non-entity schema artifacts.
 *
 * Entity schemas are handled by `compileEntities`.
 * Entity models are handled by `compileModels`.
 */
export function compileSchemas(ctx: CompilerContext): void {
  compileDtos(ctx);
  compileParams(ctx);
}
