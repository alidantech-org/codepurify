// tests/compiler/write-ir-package.test.ts

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createIrJsonFileName, emitIrContract, writeIrPackage } from '@/app';

import { demoConfig as config, v1 } from '../fixtures/contracts/demo.contract';

// ============================================================================
// OUTPUT
// ============================================================================

const outputFolder = join('tests', 'generated', 'ir');

// ============================================================================
// TEST
// ============================================================================

describe('writeIrPackage', () => {
  it('writes canonical versioned IR JSON and YAML files', async () => {
    rmSync(outputFolder, {
      recursive: true,
      force: true,
    });

    const result = await writeIrPackage({
      ...config,
      output: {
        folder: outputFolder,
      },
    });

    expect(result.files).toContain('tests/generated/ir/codepot.v1.json');
    expect(result.files).toContain('tests/generated/ir/codepot.v1.yaml');

    const jsonPath = join(outputFolder, 'codepot.v1.json');
    const yamlPath = join(outputFolder, 'codepot.v1.yaml');

    expect(existsSync(jsonPath)).toBe(true);
    expect(existsSync(yamlPath)).toBe(true);

    const ir = JSON.parse(readFileSync(jsonPath, 'utf8'));

    expect(ir.codepot).toBeDefined();
    expect(ir.version).toBe(1);
    expect(ir.content_types.json).toBeDefined();
    expect(ir.properties.primitives).toBeDefined();
    expect(ir.schemas.entities).toBeDefined();
    expect(ir.schemas.models).toBeDefined();
    expect(ir.schemas.dtos).toBeDefined();
    expect(ir.responses.errors).toBeDefined();
    expect(ir.resources).toBeDefined();
  });

  it('creates the JSON filename from the compiled IR version', () => {
    const ir = emitIrContract(v1.snapshot());

    expect(createIrJsonFileName(ir)).toBe('codepot.v1.json');
  });
});
