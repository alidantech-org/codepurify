// src/pipeline/writer/write-files.ts

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { PackageWriteFile, PackageWriteResult } from './write-package';

export interface WriteFilesOptions {
  readonly dryRun?: boolean;
}

export interface WrittenFileResult {
  readonly path: string;
  readonly changed: boolean;
  readonly dryRun: boolean;
}

export interface WriteFilesResult {
  readonly files: readonly WrittenFileResult[];
}

export async function writeFiles(
  packageWriteResult: PackageWriteResult,
  options: WriteFilesOptions = {},
): Promise<WriteFilesResult> {
  const files: WrittenFileResult[] = [];

  for (const file of packageWriteResult.files) {
    files.push(await writeOneFile(file, options));
  }

  return { files };
}

async function writeOneFile(
  file: PackageWriteFile,
  options: WriteFilesOptions,
): Promise<WrittenFileResult> {
  if (options.dryRun) {
    return {
      path: file.path,
      changed: true,
      dryRun: true,
    };
  }

  await mkdir(dirname(file.path), { recursive: true });
  await writeFile(file.path, file.content, 'utf8');

  return {
    path: file.path,
    changed: true,
    dryRun: false,
  };
}
