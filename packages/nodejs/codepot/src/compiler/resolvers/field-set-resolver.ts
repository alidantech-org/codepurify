// src/compiler/resolvers/field-set-resolver.ts

import type { EntityFieldInput, EntityFieldInputLike, EntityFieldSetOverrideInput } from '@/contract/types/authoring/4.properties-builder';
import type { EntityAuthoringDefinition } from '@/contract/types/authoring/5.schemas-builder';

import type { Ref } from '@/contract/types/ir/ref';

import type { CompilerContext } from '../context/compiler-context';

import { entityFieldRef } from './ref-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// TYPES
// ============================================================================

export interface ResolveFieldSetInput {
  readonly ctx: CompilerContext;
  readonly entity_key: string;
  readonly field_set_key: string;
  readonly override: EntityFieldSetOverrideInput<any>;
}

export interface EntityFieldOwner {
  readonly entity_key: string;
  readonly field_key: string;
}

// ============================================================================
// FIELD INPUT NORMALIZATION
// ============================================================================

/**
 * Unwraps a field builder into its raw authoring field input.
 */
function unwrapEntityFieldInput(input: EntityFieldInputLike): EntityFieldInput {
  if ('input' in input) {
    return input.input;
  }

  return input;
}

// ============================================================================
// ENTITY LOOKUP
// ============================================================================

/**
 * Returns an authoring entity by compiled snake_case key.
 */
function getAuthoringEntityByCompiledKey(ctx: CompilerContext, compiledEntityKey: string): EntityAuthoringDefinition {
  for (const [rawKey, entity] of Object.entries(ctx.authoring.schemas.entities ?? {})) {
    if (toSnakeCaseKey(rawKey) === compiledEntityKey) {
      return entity;
    }
  }

  throw new Error(`Unable to find authoring entity "${compiledEntityKey}".`);
}

/**
 * Gets the parent entity key for an authoring entity.
 */
function getParentEntityKey(entity: EntityAuthoringDefinition): string | undefined {
  if (entity.extends === undefined) return undefined;

  return toSnakeCaseKey(entity.extends.key);
}

// ============================================================================
// FIELD OWNERSHIP
// ============================================================================

/**
 * Collects fields owned by the inheritance chain.
 *
 * Parent fields are collected first. Child fields override same-name parent
 * fields if a conflict exists.
 */
function collectFieldOwners(ctx: CompilerContext, entityKey: string): Map<string, EntityFieldOwner> {
  const entity = getAuthoringEntityByCompiledKey(ctx, entityKey);
  const parentKey = getParentEntityKey(entity);

  const output = parentKey !== undefined ? collectFieldOwners(ctx, parentKey) : new Map<string, EntityFieldOwner>();

  for (const [rawFieldKey, rawField] of Object.entries(entity.fields)) {
    const field = unwrapEntityFieldInput(rawField);
    const fieldKey = toSnakeCaseKey(rawFieldKey);

    output.set(fieldKey, {
      entity_key: entityKey,
      field_key: fieldKey,
    });

    // Keep variable used intentionally for future metadata rules.
    void field;
  }

  return output;
}

/**
 * Resolves a field key to the entity that actually owns it.
 */
function resolveFieldOwner(ctx: CompilerContext, entityKey: string, fieldKey: string): EntityFieldOwner {
  const owners = collectFieldOwners(ctx, entityKey);
  const owner = owners.get(toSnakeCaseKey(fieldKey));

  if (owner === undefined) {
    throw new Error(`Field set references unknown field "${entityKey}.${toSnakeCaseKey(fieldKey)}".`);
  }

  return owner;
}

// ============================================================================
// OVERRIDE FIELD SELECTION
// ============================================================================

/**
 * Gets the field names listed in a field-set override.
 */
function getOverrideFields(override: EntityFieldSetOverrideInput<any>): readonly string[] {
  return (override.fields ?? []).map((field) => String(field));
}

/**
 * Applies field-set override mode.
 *
 * For now:
 * - only: use exactly listed fields
 * - exclude: use all fields except listed fields
 * - include: use all fields plus listed fields
 *
 * If mode is missing, treat it as "only".
 */
function selectFieldKeys(ctx: CompilerContext, entityKey: string, override: EntityFieldSetOverrideInput<any>): readonly string[] {
  const owners = collectFieldOwners(ctx, entityKey);
  const allKeys = [...owners.keys()];
  const overrideKeys = getOverrideFields(override).map(toSnakeCaseKey);
  const mode = override.mode ?? 'only';

  if (mode === 'only') {
    return overrideKeys;
  }

  if (mode === 'exclude') {
    const excluded = new Set(overrideKeys);

    return allKeys.filter((key) => !excluded.has(key));
  }

  if (mode === 'include') {
    return [...new Set([...allKeys, ...overrideKeys])];
  }

  throw new Error(`Unsupported field-set override mode "${mode}".`);
}

// ============================================================================
// RESOLVE
// ============================================================================

/**
 * Resolves one authoring field-set override into an array of IR entity field
 * refs.
 */
export function resolveFieldSet(input: ResolveFieldSetInput): readonly Ref[] {
  const fieldKeys = selectFieldKeys(input.ctx, input.entity_key, input.override);

  return fieldKeys.map((fieldKey) => {
    const owner = resolveFieldOwner(input.ctx, input.entity_key, fieldKey);

    return entityFieldRef(owner.entity_key, owner.field_key);
  });
}

/**
 * Creates the compiled field-set key.
 */
export function createFieldSetKey(entityKey: string, fieldSetKey: string): string {
  return `${toSnakeCaseKey(entityKey)}.${toSnakeCaseKey(fieldSetKey)}`;
}
