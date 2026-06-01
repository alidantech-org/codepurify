import { describe, expect, it } from 'vitest';

import { compile } from '@/compiler';
import { v1 } from '../fixtures/contracts/demo.contract';

describe('compiler properties', () => {
  it('compiles authoring properties into snake_case IR properties', () => {
    // Create a minimal authoring state with only primitives and enums
    // (composites with inline members are not yet supported in slice 1)
    const fullState = v1.snapshot();
    const minimalState = {
      ...fullState,
      properties: {
        primitives: fullState.properties.primitives,
        enums: fullState.properties.enums,
        composites: {}, // Skip composites for now - inline promotion in slice 2
      },
    };

    const ir = compile(minimalState);

    expect(ir.properties.primitives.id).toEqual({
      type: 'string',
      format: 'uuid',
    });

    expect(ir.properties.primitives.date_time).toEqual({
      type: 'string',
      format: 'date-time',
    });

    expect(ir.properties.primitives.display_name.validation).toEqual({
      min_length: 2,
      max_length: 80,
    });

    expect(ir.properties.enums.user_role.values).toEqual([
      { value: 'owner', label: 'Owner' },
      { value: 'admin', label: 'Admin' },
      { value: 'member', label: 'Member' },
    ]);
  });
});
