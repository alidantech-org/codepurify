import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { writeDebugFiles } from '@/index';
import { demoConfig } from '@/tests/fixtures/contracts/demo.contract';

describe('writeDebugFiles', () => {
  it('writes authoring debug json and yaml files', async () => {
    const result = await writeDebugFiles(demoConfig);

    expect(result.files).toEqual([
      'tests/generated/debug/demo.authoring.json',
      'tests/generated/debug/demo.authoring.yaml',
    ]);

    for (const file of result.files) {
      expect(existsSync(file)).toBe(true);
    }

    const json = readFileSync(
      'tests/generated/debug/demo.authoring.json',
      'utf8',
    );

    const yaml = readFileSync(
      'tests/generated/debug/demo.authoring.yaml',
      'utf8',
    );

    expect(json).toContain('security:auth:jwt');
    expect(json).toContain('transport:response:BadRequest');
    expect(json).not.toContain('"$ref"');
    expect(json).not.toContain('#/schemas');

    expect(yaml).toContain('security:auth:jwt');
    expect(yaml).toContain('transport:response:BadRequest');
    expect(yaml).not.toContain('$ref');
    expect(yaml).not.toContain('#/schemas');
  });
});
