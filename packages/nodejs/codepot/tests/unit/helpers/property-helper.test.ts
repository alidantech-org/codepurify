import { describe, expect, it } from 'vitest';

import {
  access,
  field,
  persistence,
  property,
  query,
} from '@/index';

import { PrimitiveFormat, PrimitiveType } from '@/contract/types/properties/primitive/definition';

describe('property helpers', () => {
  it('creates static primitive facts', () => {
    const email = property.email().minLength(3).maxLength(120).build();

    expect(email).toEqual({
      kind: 'primitive',
      type: PrimitiveType.string,
      format: PrimitiveFormat.email,
      validation: {
        minLength: 3,
        maxLength: 120,
      },
    });
  });

  it('creates query options', () => {
    const options = query
      .filter()
      .sort()
      .operators((op) => op.eq().contains())
      .done();

    expect(options).toEqual({
      filter: true,
      sort: true,
      operators: ['eq', 'contains'],
    });
  });

  it('creates entity field input', () => {
    const input = field.email({
      required: true,
      access: access.public().sensitive().done(),
      persistence: persistence.stored().immutable().done(),
    });

    expect(input.options?.required).toBe(true);
    expect(input.options?.access?.sensitive).toBe(true);
    expect(input.options?.persistence?.immutable).toBe(true);
  });
});
