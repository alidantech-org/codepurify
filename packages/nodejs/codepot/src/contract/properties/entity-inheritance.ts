import type { SchemaField, SchemaFieldMap } from '../schema/schema.types.js';

import type { EntityInheritanceInput, EntityPropertyRefs, EntityRegistryResult } from './property.types.js';

export function normalizeExtends(inherited: EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined): EntityPropertyRefs[] {
  if (!inherited) return [];

  if (Array.isArray(inherited)) {
    return inherited.flatMap((item) => normalizeExtends(item));
  }

  if (isEntityRegistryResult(inherited)) {
    return [inherited.ref];
  }

  if (isEntityPropertyRefs(inherited)) {
    return [inherited];
  }

  throw new Error(
    [
      'Invalid entity inheritance source.',
      'Use the value returned by .entity(...), e.g. extends: baseEntity.',
      'Received value does not match the current EntityPropertyRefs shape.',
    ].join(' '),
  );
}

export function mergeInheritedFields(
  inherited: EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined,
  fields: Record<string, SchemaField>,
): Record<string, SchemaField> {
  return {
    ...collectInheritedFields(inherited),
    ...fields,
  };
}

function collectInheritedFields(
  inherited: EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined,
): Record<string, SchemaField> {
  if (!inherited) return {};

  if (Array.isArray(inherited)) {
    return inherited.reduce<Record<string, SchemaField>>(
      (acc, item) => ({
        ...acc,
        ...collectInheritedFields(item),
      }),
      {},
    );
  }

  const ref = isEntityRegistryResult(inherited) ? inherited.ref : inherited;

  if (!isEntityPropertyRefs(ref)) return {};

  return ref.model.sourceFields ?? {};
}

function isEntityRegistryResult(
  value: unknown,
): value is EntityRegistryResult<string, Record<string, SchemaField>, Record<string, SchemaField>> {
  if (!isRecord(value)) return false;

  return isEntityPropertyRefs(value.ref);
}

function isEntityPropertyRefs(value: unknown): value is EntityPropertyRefs {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === 'string' &&
    isRecord(value.fields) &&
    isRecord(value.model) &&
    isRecord(value.publicModel) &&
    isRecord(value.internalModel) &&
    isRecord(value.partialModel) &&
    isRecord(value.publicPartialModel) &&
    isRecord(value.internalPartialModel) &&
    isRecord(value.queryFilterModel) &&
    isRecord(value.values) &&
    isRecord(value.values.querySort) &&
    isRecord(value.values.querySelect)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
