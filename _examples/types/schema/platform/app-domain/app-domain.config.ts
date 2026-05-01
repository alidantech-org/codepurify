// //////////////////////////////////////////////////////////////////////////////
//  IMPORTS
// //////////////////////////////////////////////////////////////////////////////

import * as T from './app-domain.types';
import * as B from '../../../shared/base';

// tempura items
import { DefineKeysArray } from '../../../tempura/fields.defination';
import { EntityDBDefinition, EntityMeta } from '../../../tempura/database.defination';
import { EAppEnvironment } from '../../../enums/platform';
import { APP_META } from '../app';

const { query: q, mutation: m } = B.BASE_FIELDS;

// //////////////////////////////////////////////////////////////////////////////
//  CONST KEY ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export const APP_DOMAIN_FIELDS: DefineKeysArray<T.IAppDomain> = {
  query: {
    selectable: [...q.selectable, 'domain', 'environment', 'isPrimary', 'isActive', 'appId'],
    defaultSelect: [...q.defaultSelect, 'domain', 'environment', 'isPrimary', 'isActive'],
    sortable: [...q.sortable, 'domain', 'environment', 'isPrimary', 'isActive'],
    searchable: [...q.searchable, 'domain'],
    filterable: [...q.filterable, 'environment', 'isPrimary', 'isActive', 'appId'],
    dateRange: [...q.dateRange],
  },

  mutation: {
    creatable: ['domain', 'environment', 'isPrimary', 'isActive'],
    systemCreatable: ['domain', 'environment', 'isPrimary', 'isActive', 'appId'],
    updatable: ['domain', 'environment', 'isPrimary', 'isActive'],
    editable: ['domain', 'environment', 'isPrimary', 'isActive', 'appId'],
    readonly: [...m.readonly, 'app'],
    immutable: [...m.immutable, 'appId', 'app'],
  },

  relation: { keys: ['app'] },

  state: { transition: [], toggle: ['isPrimary', 'isActive'] },

  business: { contextual: ['appId'] },

  security: { sensitive: [] },

  system: { persisted: ['appId'], computed: [] },
} as const;

export const APP_DOMAIN_META: EntityMeta = {
  name: 'AppDomain',
  module: 'platform',
  schema: 'platform',
  tableName: 'app_domains',
  route: 'app-domains',
  entityClass: 'AppDomainEntity',
};

export const APP_DOMAIN_DB: EntityDBDefinition<T.IAppDomain, B.IBase, 'typeorm'> = {
  target: { provider: 'typeorm', dialect: 'postgres', schema: 'platform', tableName: 'app_domains' },

  fields: {
    domain: { type: 'varchar', name: 'domain', length: 255 },
    environment: { type: 'simple-enum', name: 'environment', enum: EAppEnvironment },
    isPrimary: { type: 'boolean', name: 'is_primary', default: false },
    isActive: { type: 'boolean', name: 'is_active', default: true },
    appId: { type: 'uuid', name: 'app_id' },
  },

  relations: {
    app: { kind: 'many-to-one', entityMeta: APP_META, inverseSide: 'domains', joinColumn: 'app_id' },
  },

  indexes: [
    { fields: ['domain'] },
    { fields: ['environment'] },
    { fields: ['appId'] },
    { fields: ['appId', 'environment'] },
    { fields: ['domain', 'environment'], unique: true },
  ],

  checks: [
    { name: 'chk_app_domain_not_empty', expression: `domain <> ''` },
    {
      name: 'chk_app_domain_one_primary_per_app',
      expression: `(is_primary = false OR (SELECT COUNT(*) FROM app_domains WHERE app_id = app_id AND is_primary = true) = 1)`,
    },
  ],

  options: { timestamps: true, audit: true },
} as const;
