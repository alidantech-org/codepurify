import { describe, expect, it } from 'vitest';

import { writePackage } from '@/index';
import { demoConfig } from '../../fixtures/contracts/demo.contract';

describe('Codepot writer smoke test', () => {
  it('plans json and yaml files', () => {
    const result = writePackage(demoConfig);

    expect(result.files).toHaveLength(2);

    expect(result.files.map((file) => file.path)).toEqual(['tests/smoke/generated/demo.v1.json', 'tests/smoke/generated/demo.v1.yaml']);

    expect(result.files[0].content).toContain('"codepot"');
    expect(result.files[1].content).toContain('codepot:');
  });
});
