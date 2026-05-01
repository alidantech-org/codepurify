import * as T from './app.types';
import * as B from '../../../shared/base';

// tempura items
import { DefineKeysArray } from '../../../tempura/fields.definition';
import { EntityDBDefinition, EntityMeta } from '../../../tempura/database.defination';
import { EAppStatus, EAppType } from '../../../enums/platform';
import { APP_API_KEY_META } from '../app-api-key';
import { APP_DOMAIN_META } from '../app-domain';
import { USER_META } from '../../auth/user';

const { query: q, mutation: m } = B.BASE_FIELDS;

// //////////////////////////////////////////////////////////////////////////////
//  CONST KEY ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export const APP_FIELDS: DefineKeysArray<T.IApp> = {
  query: {
    selectable: [...q.selectable, 'name', 'slug', 'description', 'status', 'ownerId'],
    defaultSelect: [...q.defaultSelect, 'name', 'slug'],
    sortable: [...q.sortable, 'name', 'slug', 'status'],
    searchable: [...q.searchable, 'name', 'slug', 'description'],
    filterable: [...q.filterable, 'appType', 'status', 'isInternal', 'isActive', 'ownerId'],
    dateRange: [...q.dateRange],
  },

  mutation: {
    creatable: ['name', 'slug', 'description', 'isInternal', 'isActive', 'appType'],
    updatable: ['name', 'description', 'isInternal', 'isActive'],

    systemCreatable: ['name', 'slug', 'description', 'isInternal', 'isActive', 'appType', 'status', 'ownerId'],
    editable: ['name', 'slug', 'description', 'isInternal', 'isActive', 'appType', 'status', 'ownerId'],
    readonly: [...m.readonly, 'apiKeys', 'domains', 'owner'],
    immutable: [...m.immutable, 'apiKeys', 'domains', 'owner', 'status'],
  },

  relation: { keys: ['apiKeys', 'domains', 'owner'] },

  state: { transition: ['status'], toggle: ['isInternal', 'isActive'] },

  business: { contextual: ['ownerId'] },

  security: { sensitive: [] },

  system: { persisted: ['ownerId'], computed: [] },
} as const;

export const APP_META: EntityMeta = {
  name: 'App',
  module: 'platform',
  schema: 'platform',
  tableName: 'apps',
  route: 'apps',
  entityClass: 'AppEntity',
};

export const APP_DB: EntityDBDefinition<T.IApp, B.IBase, 'typeorm'> = {
  target: { provider: 'typeorm', dialect: 'postgres', schema: 'platform', tableName: 'apps' },

  fields: {
    name: { type: 'varchar', name: 'name', length: 255 },
    slug: { type: 'varchar', name: 'slug', length: 255 },
    description: { type: 'text', name: 'description', nullable: true },
    isInternal: { type: 'boolean', name: 'is_internal', default: false },
    isActive: { type: 'boolean', name: 'is_active', default: true },
    appType: { type: 'simple-enum', name: 'app_type', enum: EAppType },
    status: { type: 'simple-enum', name: 'status', enum: EAppStatus, default: EAppStatus.Active },
    ownerId: { type: 'uuid', name: 'owner_id', nullable: true },
  },

  relations: {
    owner: { kind: 'many-to-one', entityMeta: USER_META, inverseSide: 'apps', onDelete: 'CASCADE', joinColumn: 'owner_id' },
    apiKeys: { kind: 'one-to-many', entityMeta: APP_API_KEY_META, inverseSide: 'app', cascade: true },
    domains: { kind: 'one-to-many', entityMeta: APP_DOMAIN_META, inverseSide: 'app', cascade: true },
  },
  indexes: [{ fields: ['name'] }, { fields: ['slug'], unique: true }, { fields: ['appType', 'status'] }, { fields: ['ownerId'] }],

  checks: [
    { name: 'chk_apps_slug_not_empty', expression: `slug <> ''` },
    { name: 'chk_apps_name_not_empty', expression: `name <> ''` },
  ],

  options: { timestamps: true, audit: true },
} as const;
