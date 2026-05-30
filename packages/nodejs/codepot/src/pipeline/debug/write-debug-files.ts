import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { CodepotConfig } from '@/contract/types/core/1.codepot-config.types';
import { writeDebugPackageJson, writeDebugPackageYaml } from './write-debug-package';

export interface WriteDebugFilesResult {
  readonly files: readonly string[];
}

function toPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

export async function writeDebugFiles(config: CodepotConfig): Promise<WriteDebugFilesResult> {
  const folder = config.output?.folder ?? 'debug';
  const baseName = config.output?.baseName ?? 'codepot';

  await mkdir(folder, {
    recursive: true,
  });

  const jsonPath = path.join(folder, `${baseName}.authoring.json`);
  const yamlPath = path.join(folder, `${baseName}.authoring.yaml`);

  await writeFile(jsonPath, writeDebugPackageJson(config), 'utf8');
  await writeFile(yamlPath, writeDebugPackageYaml(config), 'utf8');

  return {
    files: [toPosixPath(jsonPath), toPosixPath(yamlPath)],
  };
}
