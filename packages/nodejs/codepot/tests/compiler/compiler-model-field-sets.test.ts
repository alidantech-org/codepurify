import { describe, expect, it } from 'vitest';

import { compile } from '@/compiler';
import { v1 } from '../fixtures/contracts/demo.contract';

describe('compiler model field sets', () => {
  it('attaches field_set refs to query models', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.models.user_query.field_sets).toEqual({
      select: {
        $ref: '#/schemas/field_sets/user.list_select',
      },
      sort: {
        $ref: '#/schemas/field_sets/user.list_sort',
      },
      filter: {
        $ref: '#/schemas/field_sets/user.list_filter',
      },
    });
  });

  it('attaches public list select field set to public_list model', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.models.user_public_list.field_sets?.select).toEqual({
      $ref: '#/schemas/field_sets/user.public_list_select',
    });
  });

  it('attaches admin select field set to admin model', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.models.user_admin.field_sets?.select).toEqual({
      $ref: '#/schemas/field_sets/user.admin_list_select',
    });
  });
});
