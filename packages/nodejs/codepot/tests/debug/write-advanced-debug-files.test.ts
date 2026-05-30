import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { writeDebugFiles } from '@/index';
import { advancedConfig } from '@/tests/fixtures/contracts/advanced.contract';

describe('writeDebugFiles advanced', () => {
  it('writes advanced debug json and yaml files', async () => {
    const result = await writeDebugFiles(advancedConfig);

    expect(result.files).toEqual(['tests/generated/debug/advanced.authoring.json', 'tests/generated/debug/advanced.authoring.yaml']);

    for (const file of result.files) {
      expect(existsSync(file)).toBe(true);
    }

    const json = readFileSync('tests/generated/debug/advanced.authoring.json', 'utf8');

    expect(json).toContain('advanced_demo_api');
    expect(json).toContain('schema:entity:Order');
    expect(json).toContain('resource:orders:operation:createOrder');
    expect(json).not.toContain('"$ref"');
  });
});
