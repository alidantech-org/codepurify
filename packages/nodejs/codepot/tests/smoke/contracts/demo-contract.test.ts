import { describe, expect, it } from 'vitest';

import { compilePackage, compileVersionContract } from '@/index';
import { demoConfig, demoVersion } from '../../fixtures/contracts/demo.contract';
import { expectValidCodepotDefinition } from '../../utils/assert-codepot-definition';

describe('demo contract smoke test', () => {
  it('compiles a version contract into CodepotDefinition', () => {
    const definition = compileVersionContract(demoVersion);

    expectValidCodepotDefinition(definition);

    expect(definition.key).toBe('demo_api');
    expect(definition.version).toBe(1);
  });

  it('compiles a Codepot config package', () => {
    const compiled = compilePackage(demoConfig);

    expect(compiled.contracts).toHaveLength(1);
    expectValidCodepotDefinition(compiled.contracts[0]);
  });
});
