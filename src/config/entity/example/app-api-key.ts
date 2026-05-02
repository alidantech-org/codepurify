import {
  defineFields,
  uuidField,
  query,
  mutation,
  stringField,
  secretStringField,
  booleanField,
  toggle,
  enumField,
  relationField,
  field,
  transition,
} from '../helpers';
import { IEntityConfig, RelationConfigUnion } from '../types';
import AppEntityConfig from './app';

export default class AppApiKeyEntityConfig implements IEntityConfig {
  base = null;
  workflows = [];
  key = 'app_api_key';
  group_key = 'platform';

  fields = defineFields({
    id: uuidField({
      query: query().defaultSelect().build(),
      mutation: mutation().systemOnly().generated().immutable().build(),
    }),

    appId: uuidField({
      query: query().filter().build(),
      mutation: mutation().create('system').update(false).edit('system').persisted().immutable().build(),
    }),

    name: stringField({
      length: 255,
      query: query().defaultSelect().sort().search().build(),
      mutation: mutation().apiWritable().build(),
    }),

    keyHash: secretStringField({
      length: 255,
      query: { select: false, filter: false },
      mutation: mutation().create('system').update('system').edit('system').persisted().build(),
    }),

    keyPrefix: stringField({
      length: 10,
      query: query().defaultSelect().build(),
      mutation: mutation().systemOnly().build(),
    }),

    isActive: booleanField({
      default: true,
      query: query().filter().build(),
      mutation: mutation().apiWritable().build(),
      state: toggle(),
    }),
    expiresAt: stringField({ nullable: true, query: query().filter().build(), mutation: mutation().apiWritable().build() }),
    lastUsedAt: stringField({ nullable: true, query: query().sort().build(), mutation: mutation().systemOnly().build() }),

    permissions: enumField(['read', 'write', 'admin'] as const, {
      default: 'read',
      query: query().filter().build(),
      mutation: mutation().apiWritable().build(),
    }),
    status: enumField(['active', 'expired', 'revoked'] as const, {
      default: 'active',
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
    }),
  });

  get relations(): Record<string, RelationConfigUnion> {
    return {
      app: relationField(this, AppEntityConfig, {
        relation: {
          kind: 'many_to_one',
          local_field: () => this.fields.appId,
          remote_field: () => new AppEntityConfig().fields.name,
          on_delete: 'CASCADE',
        },
        query: { select: true },
      }),
    };
  }

  indexes = [
    { fields: [() => this.fields.appId] },
    { fields: [() => this.fields.keyHash], unique: true },
    { fields: [() => this.fields.keyPrefix] },
    { fields: [() => this.fields.isActive] },
    { fields: [() => this.fields.expiresAt] },
    { fields: [() => this.fields.lastUsedAt] },
    { fields: [() => this.fields.status] },
  ];

  checks = [
    {
      name: 'name_not_empty',
      rule: field(() => this.fields.name).notEmpty(),
    },
    {
      name: 'key_prefix_not_empty',
      rule: field(() => this.fields.keyPrefix).notEmpty(),
    },
  ];

  transitions = [
    transition({
      field: () => this.fields.status,
      initial: this.fields.status.values.active,
      terminal: [this.fields.status.values.revoked],
      transitions: {
        [this.fields.status.values.active]: [this.fields.status.values.expired, this.fields.status.values.revoked],
        [this.fields.status.values.expired]: [this.fields.status.values.revoked],
        [this.fields.status.values.revoked]: [],
      },
    }),
  ];

  options = { timestamps: true, audit: true };
  templates = ['entity.meta', 'entity.types', 'entity.fields', 'entity.constants', 'typeorm.entity', 'typeorm.repository'];
}
