// //////////////////////////////////////////////////////////////////////////////
//  IMPORTS
// //////////////////////////////////////////////////////////////////////////////

import * as T from './app-api-key.types';
import * as B from '../../../shared/base';

// tempura items
import { DefineKeysArray } from '../../../tempura/fields.defination';
import { EntityDBDefinition, EntityMeta } from '../../../tempura/database.defination';
import { EApiKeyStatus } from '../../../enums/platform';
import { APP_META } from '../app';

const { query: q, mutation: m } = B.BASE_FIELDS;

// //////////////////////////////////////////////////////////////////////////////
//  CONST KEY ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export const APP_API_KEY_FIELDS: DefineKeysArray<T.IAppApiKey> = {
  query: {
    selectable: [...q.selectable, 'appId', 'name', 'keyPrefix', 'keyHash', 'status', 'expiresAt', 'lastUsedAt', 'revokedAt', 'isActive'],
    defaultSelect: [
      ...q.defaultSelect,
      'appId',
      'name',
      'keyPrefix',
      'keyHash',
      'status',
      'expiresAt',
      'lastUsedAt',
      'revokedAt',
      'isActive',
    ],
    sortable: [...q.sortable, 'appId', 'name', 'keyPrefix', 'status', 'expiresAt', 'lastUsedAt', 'revokedAt', 'isActive'],
    searchable: [...q.searchable, 'name', 'keyPrefix'],
    filterable: [...q.filterable, 'appId', 'status', 'isActive'],
    dateRange: [...q.dateRange, 'expiresAt', 'lastUsedAt', 'revokedAt'],
  },

  mutation: {
    creatable: ['appId', 'name', 'keyPrefix', 'keyHash', 'isActive'],
    systemCreatable: ['appId', 'name', 'keyPrefix', 'keyHash', 'status', 'expiresAt', 'lastUsedAt', 'revokedAt', 'isActive'],
    updatable: ['name', 'keyPrefix', 'keyHash', 'isActive'],
    editable: ['appId', 'name', 'keyPrefix', 'keyHash', 'status', 'expiresAt', 'lastUsedAt', 'revokedAt', 'isActive'],
    readonly: [...m.readonly, 'app'],
    immutable: [...m.immutable, 'appId', 'app'],
  },

  relation: { keys: ['app'] },

  state: { transition: ['status'], toggle: ['isActive'] },

  business: { contextual: [] },

  security: { sensitive: ['keyHash'] },

  system: { persisted: ['appId'], computed: [] },
} as const;

export const APP_API_KEY_META: EntityMeta = {
  name: 'AppApiKey',
  module: 'platform',
  schema: 'platform',
  tableName: 'app_api_keys',
  route: 'app-api-keys',
  entityClass: 'AppApiKeyEntity',
};

export const APP_API_KEY_DB: EntityDBDefinition<T.IAppApiKey, B.IBase, 'typeorm'> = {
  target: { provider: 'typeorm', dialect: 'postgres', schema: 'platform', tableName: 'app_api_keys' },

  fields: {
    appId: { type: 'uuid', name: 'app_id' },
    name: { type: 'varchar', name: 'name', length: 255 },
    keyPrefix: { type: 'varchar', name: 'key_prefix', length: 10 },
    keyHash: { type: 'varchar', name: 'key_hash', length: 255 },
    isActive: { type: 'boolean', name: 'is_active', default: true },
    status: { type: 'simple-enum', name: 'status', enum: EApiKeyStatus, default: EApiKeyStatus.Active },
    expiresAt: { type: 'timestamp', name: 'expires_at', nullable: true },
    lastUsedAt: { type: 'timestamp', name: 'last_used_at', nullable: true },
    revokedAt: { type: 'timestamp', name: 'revoked_at', nullable: true },
  },

  relations: {
    app: { kind: 'many-to-one', entityMeta: APP_META, inverseSide: 'apiKeys', joinColumn: 'app_id' },
  },

  indexes: [
    { fields: ['appId'] },
    { fields: ['keyPrefix'] },
    { fields: ['keyHash'] },
    { fields: ['status'] },
    { fields: ['expiresAt'] },
    { fields: ['appId', 'status'] },
  ],

  checks: [
    { name: 'chk_app_api_key_prefix_not_empty', expression: `key_prefix <> ''` },
    { name: 'chk_app_api_key_hash_not_empty', expression: `key_hash <> ''` },
  ],

  options: { timestamps: true, audit: true },
} as const;
