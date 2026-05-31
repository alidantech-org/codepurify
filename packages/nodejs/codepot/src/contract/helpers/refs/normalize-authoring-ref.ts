import type { AuthoringRef, EntityAuthoringRef, EntityFieldAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type { EntityExtendsInput, EntityTargetInput } from '@/contract/types/core/4.properties-builder';

export function isAuthoringRef(value: unknown): value is {
  readonly id: string;
  readonly kind: string;
  readonly key: string;
} {
  return !!value && typeof value === 'object' && 'id' in value && 'kind' in value && 'key' in value;
}

export function isEntityResult(value: unknown): value is {
  readonly entity: EntityAuthoringRef;
  readonly ref: {
    readonly fields: Record<string, EntityFieldAuthoringRef>;
  };
} {
  return !!value && typeof value === 'object' && 'entity' in value && 'ref' in value;
}

export function normalizeEntityTarget(target: EntityTargetInput | EntityExtendsInput): EntityAuthoringRef {
  if (isEntityResult(target)) return target.entity;

  return target as EntityAuthoringRef;
}

export function normalizeMaybeEntityTarget<T>(value: T): T | EntityAuthoringRef {
  if (isEntityResult(value)) return value.entity;

  return value;
}
