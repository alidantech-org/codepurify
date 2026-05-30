import { describe, expect, it } from 'vitest';

import { compileVersionContract, writeCodepotJson } from '@/index';
import { demoVersion } from '../../fixtures/contracts/demo.contract';

describe('writeCodepotJson', () => {
  it('writes pretty json with trailing newline', () => {
    const definition = compileVersionContract(demoVersion);
    const json = writeCodepotJson(definition);

    expect(json).toContain('"codepot"');
    expect(json.endsWith('\n')).toBe(true);
  });
});
