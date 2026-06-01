// src/compiler/passes/04-field-sets.ts

import type { CompilerContext } from '../context/compiler-context';

import { createFieldSetKey, resolveFieldSet } from '../resolvers/field-set-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// PASS
// ============================================================================

/**
 * Compiles entity field-set overrides into IR field_sets.
 *
 * Field sets are emitted as arrays of entity field refs. They are root schema
 * artifacts and use dotted keys like `user.list_select`.
 */
export function compileFieldSets(ctx: CompilerContext): void {
  for (const [entityKey, entity] of Object.entries(ctx.authoring.schemas.entities ?? {})) {
    const compiledEntityKey = toSnakeCaseKey(entityKey);

    for (const [fieldSetKey, override] of Object.entries(entity.fieldSetOverrides ?? {})) {
      const compiledFieldSetKey = createFieldSetKey(compiledEntityKey, fieldSetKey);

      ctx.ir.schemas.field_sets[compiledFieldSetKey] = resolveFieldSet({
        ctx,
        entity_key: compiledEntityKey,
        field_set_key: fieldSetKey,
        override,
      });
    }
  }
}
