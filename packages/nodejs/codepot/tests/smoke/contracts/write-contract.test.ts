import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { writeCodepotPackage } from '@/index';
import { demoConfig } from '../../fixtures/contracts/demo.contract';

describe('Codepot writer smoke test', () => {
  it('writes json and yaml files', async () => {
    const result = await writeCodepotPackage(demoConfig, {
      dryRun: false,
    });

    expect(result.files).toHaveLength(2);

    expect(result.files.map((file) => file.path)).toEqual(['tests/smoke/generated/demo.v1.json', 'tests/smoke/generated/demo.v1.yaml']);

    expect(existsSync('tests/smoke/generated/demo.v1.json')).toBe(true);
    expect(existsSync('tests/smoke/generated/demo.v1.yaml')).toBe(true);

    const json = await readFile('tests/smoke/generated/demo.v1.json', 'utf8');
    const yaml = await readFile('tests/smoke/generated/demo.v1.yaml', 'utf8');

    expect(json).toContain('"codepot"');
    expect(yaml).toContain('codepot:');
  });
});
