import { TSchema, TTableName } from '../enums/shared';

// //////////////////////////////////////////////////////////////////////////////
//  BASE ENTITY
// //////////////////////////////////////////////////////////////////////////////

export interface IBase {
  id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly version: number;
}

/* keys */

export const keys =
  <TKey extends PropertyKey>() =>
  <const TFields extends readonly TKey[]>(fields: TFields) =>
    fields;

export type IBaseKey = keyof IBase;

const baseKeys = keys<IBaseKey>();

// //////////////////////////////////////////////////////////////////////////////
//  BASE FIELD PATTERNS
// //////////////////////////////////////////////////////////////////////////////

export const BASE_FIELDS = {
  query: {
    selectable: ['id', 'createdAt', 'updatedAt'],
    defaultSelect: ['id', 'createdAt'],
    sortable: ['id', 'createdAt', 'updatedAt'],
    searchable: [] as const,
    filterable: [] as const,
    dateRange: ['createdAt', 'updatedAt'],
  },

  mutation: {
    creatable: [] as const,
    systemCreatable: [] as const,
    updatable: [] as const,
    editable: [] as const,
    readonly: ['createdAt', 'updatedAt', 'deletedAt', 'version'],
    immutable: ['createdAt', 'updatedAt', 'deletedAt', 'version'],
  },

  relation: { keys: [] as const },

  state: { transition: [] as const, toggle: [] as const },

  business: { contextual: [] as const },

  security: { sensitive: [] as const },

  system: {
    persisted: ['createdAt', 'updatedAt', 'deletedAt', 'version'],
    computed: [] as const,
  },
} as const;

// //////////////////////////////////////////////////////////////////////////////
//  CONST KEY ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export const BASE_READONLY_FIELDS = baseKeys(['createdAt', 'updatedAt', 'deletedAt', 'version']);

export const BASE_SORTABLE_FIELDS = baseKeys(['id', 'createdAt', 'updatedAt']);

export const BASE_DATE_RANGE_FIELDS = baseKeys(['createdAt', 'updatedAt']);

export const BASE_SELECTABLE_FIELDS = baseKeys(['id', 'createdAt', 'updatedAt']);

export const BASE_DEFAULT_SELECT_FIELDS = baseKeys(['id', 'createdAt']);

// //////////////////////////////////////////////////////////////////////////////
//  UNION TYPES FROM ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export type IBaseReadonlyFields = (typeof BASE_READONLY_FIELDS)[number];

export type BaseSortableField = (typeof BASE_SORTABLE_FIELDS)[number];

export type BaseDateRangeField = (typeof BASE_DATE_RANGE_FIELDS)[number];

export type BaseSelectableField = (typeof BASE_SELECTABLE_FIELDS)[number];

export type BaseDefaultSelectField = (typeof BASE_DEFAULT_SELECT_FIELDS)[number];
