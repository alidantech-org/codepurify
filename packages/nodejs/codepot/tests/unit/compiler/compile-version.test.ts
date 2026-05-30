import { describe, expect, it } from 'vitest';

import { compileVersionContract } from '@/index';
import { demoVersion } from '../../fixtures/contracts/demo.contract';
import { expectValidCodepotDefinition } from '../../utils/assert-codepot-definition';

describe('compileVersionContract', () => {
  it('normalizes partial state into full CodepotDefinition', () => {
    const definition = compileVersionContract(demoVersion);

    expectValidCodepotDefinition(definition);
    expect(definition.properties.primitives).toBeDefined();
    expect(definition.schemas.dtos).toBeDefined();
  });
});
