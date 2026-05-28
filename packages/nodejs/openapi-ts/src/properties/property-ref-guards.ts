import { RefKind } from '../refs/ref-kind.js';
import type { PropertyRef } from '../refs/ref.types.js';

import type { EntityPropertyRefs, PropertyRefGroup } from './property.types.js';

export function isPropertyRef(value: unknown): value is PropertyRef {
  return !!value && typeof value === 'object' && 'kind' in value && value.kind === RefKind.property && 'propertyKey' in value;
}

export function isPropertyRefGroup(value: unknown): value is PropertyRefGroup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (isPropertyRef(value)) return false;
  if (isEntityPropertyRefs(value)) return false;

  return Object.values(value).every(isPropertyRef);
}

export function isEntityPropertyRefs(value: unknown): value is EntityPropertyRefs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const candidate = value as Partial<EntityPropertyRefs>;

  return (
    !!candidate.fields &&
    typeof candidate.fields === 'object' &&
    !!candidate.model &&
    !!candidate.publicModel &&
    !!candidate.internalModel &&
    !!candidate.partialModel &&
    !!candidate.publicPartialModel &&
    !!candidate.internalPartialModel &&
    !!candidate.values
  );
}
