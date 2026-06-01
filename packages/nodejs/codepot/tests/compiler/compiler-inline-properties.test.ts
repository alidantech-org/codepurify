// tests/compiler/compiler-inline-properties.test.ts

import { describe, expect, it } from 'vitest';

import { compile } from '@/compiler';
import { v1 } from '../fixtures/contracts/demo.contract';

describe('compiler inline property promotion', () => {
  it('promotes inline composite members into reusable properties', () => {
    const ir = compile(v1.snapshot());

    expect(ir.properties.primitives.inline_money_amount).toEqual({
      type: 'number',
      validation: {
        minimum: 0,
      },
    });

    expect(ir.properties.primitives.inline_money_currency).toEqual({
      type: 'string',
      validation: {
        min_length: 3,
        max_length: 3,
      },
    });

    expect(ir.properties.composites.inline_money.properties.amount).toEqual({
      $ref: '#/properties/primitives/inline_money_amount',
    });

    expect(ir.properties.composites.inline_money.properties.currency).toEqual({
      $ref: '#/properties/primitives/inline_money_currency',
    });
  });
});
