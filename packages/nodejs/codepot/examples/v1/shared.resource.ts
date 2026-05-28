import z from 'zod';

import { v1 } from './version.contract';
import { schema } from 'codepot';

const shared = v1.defineResource({
  key: 'shared',
  name: 'Shared',
  route: '',
  folders: ['shared'],
});

const sharedProps = shared.defineProperties();

const sharedPrimitives = sharedProps.shared('Shared', {
  mongoId: schema.primitive(z.string().regex(/^[a-f\d]{24}$/i), { description: 'Mongo ObjectId' }),
  dateTime: schema.primitive(z.string().datetime(), { description: 'ISO datetime' }),
  displayName: schema.primitive(z.string().min(1).max(100), { description: 'Display name' }),
  success: schema.primitive(z.boolean(), { description: 'Request success state' }),
  message: schema.primitive(z.string().min(1).max(500), { description: 'Human readable message' }),
  page: schema.primitive(z.number().int().positive().max(10000), { required: false }),
  limit: schema.primitive(z.number().int().positive().max(100), { required: false }),
  total: schema.primitive(z.number().int().nonnegative(), { required: false }),
  sort: schema.primitive(z.string(), { required: false }),
  fields: schema.primitive(z.string(), { required: false }),
  populate: schema.primitive(z.string(), { required: false }),
  search: schema.primitive(z.string(), { required: false }),
});

const baseEntity = sharedProps.entity(
  'Base',
  {
    id: schema.ref(sharedPrimitives.ref.mongoId),
    createdAt: schema.ref(sharedPrimitives.ref.dateTime),
    updatedAt: schema.ref(sharedPrimitives.ref.dateTime),
    deletedAt: schema.ref(sharedPrimitives.ref.dateTime, { nullable: true, select: false, access: 'internal' }),
  },
  { abstract: true },
);

const sharedSchemas = v1.defineSchemas({
  ApiMessage: { success: sharedPrimitives.ref.success, message: sharedPrimitives.ref.message },
  PaginatedMeta: { page: sharedPrimitives.ref.page, limit: sharedPrimitives.ref.limit, total: sharedPrimitives.ref.total },
  PaginatedQuery: {
    page: sharedPrimitives.ref.page.optional(),
    limit: sharedPrimitives.ref.limit.optional(),
    sort: sharedPrimitives.ref.sort.optional(),
    fields: sharedPrimitives.ref.fields.optional(),
    populate: sharedPrimitives.ref.populate.optional(),
    search: sharedPrimitives.ref.search.optional(),
  },
  DetailsQuery: {
    fields: sharedPrimitives.ref.fields.optional(),
    populate: sharedPrimitives.ref.populate.optional(),
  },
  PaginatedResponse: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    // pagination: { page: sharedPrimitives.ref.page, limit: sharedPrimitives.ref.limit, total: sharedPrimitives.ref.total },
  },
});

export const sharedContract = { shared, sharedPrimitives, baseEntity, sharedSchemas };
