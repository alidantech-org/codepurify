import {
  defineFields,
  stringField,
  query,
  mutation,
  booleanField,
  toggle,
  enumField,
  foreignField,
  relationField,
  field,
  transition,
} from '../helpers';
import { DefineRelation, IEntityConfig } from '../types';
import AppApiKeyEntityConfig from './app-api-key';
import AppDomainEntityConfig from './app-domain';
import UserEntityConfig from './user';

export default class AppEntityConfig implements IEntityConfig {
  base = null;
  workflows = [];
  key = 'app';
  group_key = 'platform';
  options = { timestamps: true, audit: true };
  templates = ['entity.meta', 'entity.types', 'entity.fields', 'entity.constants', 'typeorm.entity', 'typeorm.repository'];

  fields = defineFields({
    name: stringField({
      length: 255,
      query: query().defaultSelect().sort().search().build(),
      mutation: mutation().apiWritable().build(),
    }),
    slug: stringField({
      length: 255,
      query: query().defaultSelect().sort().search().build(),
      mutation: mutation().apiCreateOnly().immutableAfterCreate().build(),
    }),
    description: stringField({ nullable: true, query: query().select().build(), mutation: mutation().apiWritable().build() }),

    isInternal: booleanField({
      default: false,
      query: query().filter().build(),
      mutation: mutation().apiWritable().build(),
      state: toggle(),
    }),
    isActive: booleanField({
      default: true,
      query: query().filter().build(),
      mutation: mutation().apiWritable().build(),
      state: toggle(),
    }),
    appType: enumField(['web', 'mobile', 'desktop'] as const, {
      query: query().filter().build(),
      mutation: mutation().apiCreateOnly().immutableAfterCreate().build(),
    }),
    status: enumField(['active', 'suspended', 'archived'] as const, {
      default: 'active',
      query: query().sort().build(),
      mutation: mutation().systemOnly().build(),
    }),

    ownerId: foreignField(new UserEntityConfig(), {
      nullable: true,
      query: query().filter().build(),
      mutation: mutation().create('system').update(false).edit('system').persisted().immutable().build(),
      business: { contextual: true, contextKey: 'owner' },
      system: { persisted: true },
    }),
  });

  relations: DefineRelation = {
    owner: relationField(this, UserEntityConfig, {
      relation: {
        kind: 'many_to_one',
        local_field: () => this.fields.ownerId,
        remote_field: () => new UserEntityConfig().fields.id,
        on_delete: 'CASCADE',
      },
      query: { select: true },
    }),

    apiKeys: relationField(this, AppApiKeyEntityConfig, {
      relation: {
        kind: 'one_to_many',
        remote_field: () => new AppApiKeyEntityConfig().fields.appId,
        cascade: true,
      },
      query: { select: true },
    }),

    domains: relationField(this, AppDomainEntityConfig, {
      relation: {
        kind: 'one_to_many',
        remote_field: () => new AppDomainEntityConfig().fields.appId,
        cascade: true,
      },
      query: { select: true },
    }),
  };

  indexes = [
    { fields: [() => this.fields.name] },
    { fields: [() => this.fields.slug], unique: true },
    { fields: [() => this.fields.appType, () => this.fields.status] },
    { fields: [() => this.fields.ownerId] },
  ];

  checks = [
    {
      name: 'name_not_empty',
      rule: field(() => this.fields.name).notEmpty(),
    },
    {
      name: 'slug_not_empty',
      rule: field(() => this.fields.slug).notEmpty(),
    },
  ];

  transitions = [
    transition({
      field: () => this.fields.status,
      initial: this.fields.status.values.active,
      terminal: [this.fields.status.values.archived],
      transitions: {
        [this.fields.status.values.active]: [this.fields.status.values.suspended, this.fields.status.values.archived],
        [this.fields.status.values.suspended]: [this.fields.status.values.active, this.fields.status.values.archived],
        [this.fields.status.values.archived]: [],
      },
    }),
  ];
}
