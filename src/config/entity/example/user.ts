import {
  defineFields,
  uuidField,
  query,
  mutation,
  stringField,
  booleanField,
  toggle,
  enumField,
  relationField,
  field,
  enumTransition,
} from '../helpers';
import { IEntityConfig, DefineRelation } from '../types';
import AppEntityConfig from './app';

export default class UserEntityConfig implements IEntityConfig {
  base = null;
  workflows = [];
  key = 'user';
  group_key = 'platform';
  options = { timestamps: true, audit: true, softDelete: true };
  templates = ['entity.meta', 'entity.types', 'entity.fields', 'entity.constants', 'typeorm.entity', 'typeorm.repository'];

  fields = defineFields({
    id: uuidField({
      query: query().defaultSelect().build(),
      mutation: mutation().systemOnly().generated().immutable().build(),
    }),
    email: stringField({
      length: 255,
      query: query().defaultSelect().sort().search().filter().build(),
      mutation: mutation().apiWritable().build(),
    }),
    username: stringField({
      length: 255,
      query: query().defaultSelect().sort().search().build(),
      mutation: mutation().apiWritable().build(),
    }),
    firstName: stringField({ length: 255, query: query().select().build(), mutation: mutation().apiWritable().build() }),
    lastName: stringField({ length: 255, query: query().select().build(), mutation: mutation().apiWritable().build() }),
    isActive: booleanField({
      default: true,
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
      state: toggle(),
    }),
    isEmailVerified: booleanField({
      default: false,
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
      state: toggle(),
    }),
    role: enumField(['admin', 'user', 'moderator'] as const, {
      default: 'user',
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
    }),
    status: enumField(['active', 'suspended', 'deleted'] as const, {
      default: 'active',
      query: query().filter().build(),
      mutation: mutation().systemOnly().build(),
    }),
  });

  relations: DefineRelation = {
    apps: relationField(this, AppEntityConfig, {
      relation: {
        kind: 'one_to_many',
        remote_field: () => new AppEntityConfig().fields.ownerId,
        cascade: true,
      },
      query: { select: true },
    }),
  };

  indexes = [
    { fields: [() => this.fields.email], unique: true },
    { fields: [() => this.fields.username], unique: true },
    { fields: [() => this.fields.isActive] },
    { fields: [() => this.fields.role] },
    { fields: [() => this.fields.status] },
  ];

  checks = [
    {
      name: 'email_not_empty',
      rule: field(() => this.fields.email).notEmpty(),
    },
    {
      name: 'username_not_empty',
      rule: field(() => this.fields.username).notEmpty(),
    },
    {
      name: 'email_format',
      rule: field(() => this.fields.email).regex('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    },
  ];

  transitions = [
    enumTransition(this.fields.status.values, {
      initial: this.fields.status.values.active,
      terminal: [this.fields.status.values.deleted],
      transitions: {
        [this.fields.status.values.active]: [this.fields.status.values.suspended, this.fields.status.values.deleted],
        [this.fields.status.values.suspended]: [this.fields.status.values.active, this.fields.status.values.deleted],
        [this.fields.status.values.deleted]: [],
      },
    }),
  ];
}
