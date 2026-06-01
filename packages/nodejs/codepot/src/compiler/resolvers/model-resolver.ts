// src/compiler/resolvers/model-resolver.ts

import type { EntityAuthoringDefinition } from '@/contract/types/authoring/5.schemas-builder';

import type {
  EntityFieldInput,
  EntityFieldInputLike,
  EntityModelOverrideInput,
  EntityModelVariant,
} from '@/contract/types/authoring/4.properties-builder';

import type { ModelDefinition } from '@/contract/types/ir/schema/model/definition';
import type { Ref } from '@/contract/types/ir/ref';

import type { CompilerContext } from '../context/compiler-context';

import { entityFieldRef, entityRef, fieldSetRef, modelRef } from './ref-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// INPUT
// ============================================================================

export interface ResolveModelInput {
  readonly ctx: CompilerContext;
  readonly entityKey: string;
  readonly variant: EntityModelVariant;
  readonly entity: EntityAuthoringDefinition;
  readonly override?: EntityModelOverrideInput<any>;
}

// ============================================================================
// FIELD NORMALIZATION
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

/**
 * Checks whether a field is a relation field.
 */
function isRelationField(input: EntityFieldInput): boolean {
  return input.source.mode === 'relation';
}

/**
 * Returns true when a relation should be emitted in this model.
 */
function shouldIncludeRelation(relationShape: EntityModelOverrideInput<any>['relations']): boolean {
  return relationShape === 'expand' || relationShape === 'idOnly';
}

// ============================================================================
// MODEL KEYS
// ============================================================================

/**
 * Creates the compiled model key for an entity model variant.
 */
export function createEntityModelKey(entityKey: string, variant: EntityModelVariant): string {
  return toSnakeCaseKey(`${entityKey}_${variant}`);
}

/**
 * Resolves the parent model ref when the entity extends another entity.
 *
 * If `User extends BaseEntity`, then `user_read` extends `base_entity_read`.
 */
function resolveModelExtends(variant: EntityModelVariant, entity: EntityAuthoringDefinition): Ref | undefined {
  if (entity.extends === undefined) return undefined;

  return modelRef(createEntityModelKey(entity.extends.key, variant));
}

// ============================================================================
// MODEL FIELD SETS
// ============================================================================

/**
 * Checks whether a compiled field set exists.
 */
function hasFieldSet(ctx: CompilerContext, key: string): boolean {
  return ctx.ir.schemas.field_sets[key] !== undefined;
}

/**
 * Resolves model-linked field_set refs.
 *
 * This does not replace model fields. It only attaches helper refs for codegen.
 */
function resolveModelFieldSets(ctx: CompilerContext, entityKey: string, variant: EntityModelVariant): ModelDefinition['field_sets'] {
  const output: {
    select?: Ref;
    sort?: Ref;
    filter?: Ref;
  } = {};

  const listSelectKey = `${entityKey}.list_select`;
  const listSortKey = `${entityKey}.list_sort`;
  const listFilterKey = `${entityKey}.list_filter`;
  const publicListSelectKey = `${entityKey}.public_list_select`;
  const adminListSelectKey = `${entityKey}.admin_list_select`;

  if ((variant === 'query' || variant === 'publicList') && hasFieldSet(ctx, listSelectKey)) {
    output.select = fieldSetRef(listSelectKey);
  }

  if (variant === 'query' && hasFieldSet(ctx, listSortKey)) {
    output.sort = fieldSetRef(listSortKey);
  }

  if (variant === 'query' && hasFieldSet(ctx, listFilterKey)) {
    output.filter = fieldSetRef(listFilterKey);
  }

  if (variant === 'publicList' && hasFieldSet(ctx, publicListSelectKey)) {
    output.select = fieldSetRef(publicListSelectKey);
  }

  if (variant === 'admin' && hasFieldSet(ctx, adminListSelectKey)) {
    output.select = fieldSetRef(adminListSelectKey);
  }

  return Object.keys(output).length > 0 ? output : undefined;
}

// ============================================================================
// FIELD SET CALCULATION
// ============================================================================

/**
 * Gets all owned field keys from an authoring entity.
 */
function getOwnedFieldKeys(entity: EntityAuthoringDefinition): string[] {
  return Object.keys(entity.fields);
}

/**
 * Applies model pick/omit rules to owned fields.
 */
function applyPickOmit(fieldKeys: readonly string[], override?: EntityModelOverrideInput<any>): string[] {
  let output = [...fieldKeys];

  if (override?.pick !== undefined) {
    const picked = new Set(override.pick.map((key) => String(key)));
    output = output.filter((key) => picked.has(key));
  }

  if (override?.omit !== undefined) {
    const omitted = new Set(override.omit.map((key) => String(key)));
    output = output.filter((key) => !omitted.has(key));
  }

  return output;
}

/**
 * Resolves model fields into IR refs.
 */
function resolveModelFields(
  entityKey: string,
  entity: EntityAuthoringDefinition,
  override?: EntityModelOverrideInput<any>,
): Record<string, Ref> {
  const output: Record<string, Ref> = {};
  const selectedKeys = applyPickOmit(getOwnedFieldKeys(entity), override);

  for (const fieldKey of selectedKeys) {
    const field = unwrapEntityFieldInput(entity.fields[fieldKey]);

    if (isRelationField(field) && !shouldIncludeRelation(override?.relations)) {
      continue;
    }

    const compiledFieldKey = toSnakeCaseKey(fieldKey);

    output[compiledFieldKey] = entityFieldRef(toSnakeCaseKey(entityKey), compiledFieldKey);
  }

  return output;
}

// ============================================================================
// RESOLVE
// ============================================================================

/**
 * Converts one entity model variant into an IR model definition.
 *
 * This first implementation emits model fields as refs to compiled entity
 * fields and preserves inheritance using `extends`.
 */
export function resolveModel(input: ResolveModelInput): ModelDefinition {
  const entityKey = toSnakeCaseKey(input.entityKey);
  const fieldSets = resolveModelFieldSets(input.ctx, entityKey, input.variant);

  return {
    from: entityRef(entityKey),

    ...(input.entity.extends !== undefined ? { extends: resolveModelExtends(input.variant, input.entity) } : {}),

    ...(input.override?.partial !== undefined ? { partial: input.override.partial } : {}),

    ...(input.override?.description !== undefined ? { description: input.override.description } : {}),

    ...(input.override?.deprecated !== undefined ? { deprecated: input.override.deprecated } : {}),

    ...(input.override?.meta !== undefined ? { meta: input.override.meta } : {}),

    ...(fieldSets !== undefined ? { field_sets: fieldSets } : {}),

    fields: resolveModelFields(entityKey, input.entity, input.override),
  };
}
