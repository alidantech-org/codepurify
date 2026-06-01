// src/compiler/resolvers/relation-resolver.ts

import type { EntityFieldInput, EntityRelationKind, RelationFieldSourceInput } from '@/contract/types/authoring/4.properties-builder';

import type {
  EntityRelationFieldDefinition,
  EntityRelationKind as IrEntityRelationKind,
} from '@/contract/types/ir/schema/entity/field/definition';

import type { CompilerContext } from '../context/compiler-context';

import { entityFieldRef, entityRef } from './ref-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// INPUT
// ============================================================================

export interface ResolveRelationFieldInput {
  readonly ctx: CompilerContext;
  readonly entityKey: string;
  readonly fieldKey: string;
  readonly field: EntityFieldInput;
}

// ============================================================================
// DEFINITION ITEM
// ============================================================================

/**
 * Copies shared definition metadata from authoring into IR.
 */
function resolveDefinitionItem(input: {
  readonly description?: string;
  readonly deprecated?: boolean;
  readonly meta?: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.deprecated !== undefined ? { deprecated: input.deprecated } : {}),
    ...(input.meta !== undefined ? { meta: input.meta } : {}),
  };
}

// ============================================================================
// RELATION KIND
// ============================================================================

/**
 * Converts authoring relation kind into IR relation kind.
 *
 * Authoring is camelCase, while IR relation kind values are snake_case.
 */
function resolveRelationKind(kind: EntityRelationKind): IrEntityRelationKind {
  return toSnakeCaseKey(kind) as IrEntityRelationKind;
}

// ============================================================================
// TARGETS
// ============================================================================

/**
 * Resolves an authoring entity target into an IR entity ref key.
 *
 * Supports direct entity refs and entity result objects from `schemas.entity()`.
 * Lazy targets should already be evaluated in authoring normalization later;
 * this first compiler version rejects unresolved functions clearly.
 */
function resolveTargetEntityKey(target: RelationFieldSourceInput['target']): string {
  if (typeof target === 'function') {
    throw new Error('Lazy relation targets must be normalized before relation compilation.');
  }

  if ('entity' in target && target.entity?.key) {
    return toSnakeCaseKey(target.entity.key);
  }

  if ('key' in target && typeof target.key === 'string') {
    return toSnakeCaseKey(target.key);
  }

  throw new Error('Unable to resolve relation target entity key.');
}

/**
 * Resolves an optional inverse field ref into an IR entity field ref.
 */
function resolveInverseField(inverse: RelationFieldSourceInput['inverse']) {
  if (inverse === undefined) return undefined;

  return entityFieldRef(toSnakeCaseKey(inverse.key), toSnakeCaseKey(inverse.key));
}

// ============================================================================
// THROUGH
// ============================================================================

/**
 * Resolves many-to-many through metadata into IR refs.
 */
function resolveThrough(through: RelationFieldSourceInput['through']) {
  if (through === undefined) return undefined;

  if (typeof through.entity === 'function') {
    throw new Error('Lazy through relation targets must be normalized before relation compilation.');
  }

  const throughEntityKey = 'entity' in through.entity ? toSnakeCaseKey(through.entity.entity.key) : toSnakeCaseKey(through.entity.key);

  if (!through.from || !through.to) {
    throw new Error('Relation through mapping requires both from and to fields.');
  }

  return {
    entity: entityRef(throughEntityKey),
    from: entityFieldRef(throughEntityKey, toSnakeCaseKey(through.from.key)),
    to: entityFieldRef(throughEntityKey, toSnakeCaseKey(through.to.key)),
  };
}

// ============================================================================
// OPTIONS
// ============================================================================

/**
 * Converts relation field options into IR field options.
 *
 * This intentionally mirrors only common metadata/options for now. If relation
 * fields need all property-field options, we can later extract shared field
 * option resolution from field-resolver.
 */
function resolveRelationOptions(field: EntityFieldInput) {
  const options = field.options;

  if (options === undefined) return {};

  return {
    ...resolveDefinitionItem(options),

    ...(options.required !== undefined ? { required: options.required } : {}),
    ...(options.nullable !== undefined ? { nullable: options.nullable } : {}),
    ...(options.default !== undefined ? { default: options.default } : {}),
    ...(options.array !== undefined && options.array !== false ? { array: options.array === true ? true : options.array } : {}),
    ...(options.capability !== undefined ? { capability: options.capability } : {}),
    ...(options.visibility !== undefined ? { visibility: options.visibility } : {}),
    ...(options.lifecycle !== undefined ? { lifecycle: options.lifecycle } : {}),
    ...(options.persistence !== undefined ? { persistence: options.persistence } : {}),
  };
}

// ============================================================================
// RESOLVE
// ============================================================================

/**
 * Converts an authoring relation field into an IR relation field.
 */
export function resolveRelationField(input: ResolveRelationFieldInput): EntityRelationFieldDefinition {
  const { entityKey, fieldKey, field } = input;

  if (field.source.mode !== 'relation') {
    throw new Error(`Field "${entityKey}.${fieldKey}" is not a relation field.`);
  }

  if (field.source.relation === undefined || field.source.target === undefined) {
    throw new Error(`Relation field "${entityKey}.${fieldKey}" is incomplete.`);
  }

  const source = field.source;

  return {
    ...resolveDefinitionItem(source),
    ...resolveRelationOptions(field),

    relation: resolveRelationKind(source.relation),
    target: entityRef(resolveTargetEntityKey(source.target)),

    ...(source.inverse !== undefined ? { inverse: resolveInverseField(source.inverse) } : {}),

    ...(source.through !== undefined ? { through: resolveThrough(source.through) } : {}),

    ...(source.expandable !== undefined ? { expandable: source.expandable } : {}),

    ...(source.relationName !== undefined ? { relation_name: source.relationName } : {}),
  } as EntityRelationFieldDefinition;
}
