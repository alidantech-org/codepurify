import {
  defineFields,
  uuidField,
  query,
  mutation,
  stringField,
  booleanField,
  toggle,
  enumField,
  defineRelations,
  relationField,
  field,
  transition,
} from '../helpers';
import { IEntityConfig, RelationConfigUnion } from '../types';
import AppEntityConfig from './app';

export default class AppDomainEntityConfig implements IEntityConfig {
  base = null;
  workflows = [];
  key = 'app_domain';
  group_key = 'platform';
  options = { timestamps: true, audit: true };
  templates = ['entity.meta', 'entity.types', 'entity.fields', 'entity.constants', 'typeorm.entity', 'typeorm.repository'];

  fields = defineFields({
    id: uuidField({
      query: query().defaultSelect().build(),
      mutation: mutation().systemOnly().generated().immutable().build(),
    }),
    appId: uuidField({
      query: query().filter().build(),
      mutation: mutation().create('system').update(false).edit('system').persisted().immutable().build(),
    }),
    domain: stringField({
      length: 255,
      query: query().defaultSelect().sort().search().filter().build(),
      mutation: mutation().apiWritable().build(),
    }),

    isPrimary: booleanField({
      default: false,
      query: query().filter().build(),
      mutation: mutation().apiWritable().build(),
      state: toggle(),
    }),
    isVerified: booleanField({
      default: false,
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
      state: toggle(),
    }),
    sslStatus: enumField(['none', 'pending', 'active', 'expired', 'error'] as const, {
      default: 'none',
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
    }),
    status: enumField(['active', 'inactive', 'suspended'] as const, {
      default: 'active',
      query: query().filter().build(),
      mutation: mutation().apiWritable().build(),
    }),

    verifiedAt: stringField({ nullable: true, query: query().sort().build(), mutation: mutation().systemOnly().build() }),
    expiresAt: stringField({ nullable: true, query: query().filter().build(), mutation: mutation().apiWritable().build() }),
  });

  get relations(): Record<string, RelationConfigUnion> {
    return defineRelations({
      app: relationField(this, AppEntityConfig, {
        relation: {
          kind: 'many_to_one',
          local_field: () => this.fields.appId,
          remote_field: () => new AppEntityConfig().fields.name,
          on_delete: 'CASCADE',
        },
        query: { select: true },
      }),
    });
  }

  indexes = [
    { fields: [() => this.fields.appId] },
    { fields: [() => this.fields.domain], unique: true },
    { fields: [() => this.fields.isPrimary] },
    { fields: [() => this.fields.isVerified] },
    { fields: [() => this.fields.sslStatus] },
    { fields: [() => this.fields.status] },
    { fields: [() => this.fields.verifiedAt] },
    { fields: [() => this.fields.expiresAt] },
  ];

  checks = [
    {
      name: 'domain_not_empty',
      rule: field(() => this.fields.domain).notEmpty(),
    },
  ];

  transitions = [
    transition({
      field: () => this.fields.status,
      initial: this.fields.status.values.active,
      terminal: [],
      transitions: {
        [this.fields.status.values.active]: [this.fields.status.values.inactive, this.fields.status.values.suspended],
        [this.fields.status.values.inactive]: [this.fields.status.values.active, this.fields.status.values.suspended],
        [this.fields.status.values.suspended]: [this.fields.status.values.active, this.fields.status.values.inactive],
      },
    }),
  ];
}
