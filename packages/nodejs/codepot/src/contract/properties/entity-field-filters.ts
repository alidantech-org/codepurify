import { isHiddenByDefault } from '../schema/schema-access';
import type { SchemaField, SchemaFieldMap } from '../schema/schema.types';

import type { PropertyRefGroup } from './property.types';

export function hasFieldOptions(value: unknown): value is SchemaField & {
  access?: Parameters<typeof isHiddenByDefault>[0];
  select?: boolean;
} {
  return !!value && typeof value === 'object' && 'kind' in value;
}

export function filterPublicFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasFieldOptions(field)) return true;

      return !isHiddenByDefault(field.access);
    }),
  );
}

export function filterInternalFields(fields: SchemaFieldMap, refs: PropertyRefGroup): PropertyRefGroup {
  return Object.fromEntries(
    Object.entries(refs).filter(([key]) => {
      const field = fields[key];
      if (!hasFieldOptions(field)) return true;

      return field.access !== 'secret';
    }),
  );
}

export function isSelectableField(field: unknown): boolean {
  if (!hasFieldOptions(field)) return true;

  if (field.select === false) return false;

  if ('query' in field && field.query && typeof field.query === 'object' && field.query.select === false) {
    return false;
  }

  return !isHiddenByDefault(field.access);
}
