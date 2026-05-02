import { defineEntityConfig, stringField, booleanField, enumField, uuidField, relationField } from 'codepurify';

export default defineEntityConfig({
  key: 'app',
  group_key: 'platform',
  table: { schema: 'platform' },
  extends: 'base',

  fields: {
    name: stringField({
      db: { type: 'varchar', name: 'name', length: 255 },
      required: true,
      nullable: false,
      capabilities: editableString(),
    }),

    slug: stringField({
      db: { type: 'varchar', name: 'slug', length: 255 },
      required: true,
      nullable: false,
      capabilities: editableString({ update: false }),
      mutation: { immutable: true },
    }),

    description: stringField({
      db: { type: 'text', name: 'description', nullable: true },
      nullable: true,
      capabilities: optionalString(),
    }),

    isInternal: booleanField({
      db: { type: 'boolean', name: 'is_internal', default: false },
      capabilities: toggleBoolean(),
      state: { toggle: true },
    }),

    isActive: booleanField({
      db: { type: 'boolean', name: 'is_active', default: true },
      capabilities: toggleBoolean(),
      state: { toggle: true },
    }),

    app_type: enumField({
      enum: { name: 'EAppType', values: ['web', 'mobile', 'desktop'] },
      db: { type: 'simple-enum' },
      capabilities: immutableEnum(),
      mutation: { immutable: true },
    }),

    status: enumField({
      enum: { name: 'EAppStatus', values: ['active', 'suspended', 'archived'] },
      db: { type: 'simple-enum', default: 'active' },
      capabilities: systemEnum(),
      state: {
        transition: true,
        initial: 'active',
        terminal: ['archived'],
        transitions: {
          active: ['suspended', 'archived'],
          suspended: ['active', 'archived'],
          archived: [],
        },
      },
    }),

    ownerId: uuidField({
      db: { type: 'uuid', name: 'owner_id', nullable: true },
      nullable: true,
      capabilities: {
        selectable: true,
        default_select: false,
        sortable: false,
        searchable: false,
        filterable: true,
        create: 'system',
        update: false,
        response: true,
      },
      business: { contextual: true, context_key: 'owner' },
      system: { persisted: true },
    }),

    owner: relationField({
      relation: {
        kind: 'many_to_one',
        target: { key: 'user', group_key: 'platform' },
        inverse_side: 'apps',
        join_column: 'owner_id',
        on_delete: 'CASCADE',
      },
      capabilities: readonlyRelation,
      mutation: immutableMutation,
    }),

    apiKeys: relationField({
      relation: { kind: 'one_to_many', target: { key: 'app_api_key', group_key: 'platform' }, inverse_side: 'app', cascade: true },
      capabilities: readonlyRelation,
      mutation: immutableMutation,
    }),

    domains: relationField({
      relation: { kind: 'one_to_many', target: { key: 'app_domain', group_key: 'platform' }, inverse_side: 'app', cascade: true },
      capabilities: readonlyRelation,
      mutation: immutableMutation,
    }),
  },

  indexes: [{ fields: ['name'] }, { fields: ['slug'], unique: true }, { fields: ['appType', 'status'] }, { fields: ['ownerId'] }],

  checks: [
    { name: 'chk_apps_slug_not_empty', expression: `slug <> ''` },
    { name: 'chk_apps_name_not_empty', expression: `name <> ''` },
  ],

  options: { timestamps: true, audit: true },

  templates: ['entity.meta', 'entity.types', 'entity.fields', 'entity.constants', 'typeorm.entity', 'typeorm.repository'],
} as const);
