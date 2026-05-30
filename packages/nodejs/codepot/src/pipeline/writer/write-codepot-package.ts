// src/pipeline/writer/write-codepot-package.ts

import type { CodepotConfig } from '@/contract/types/core/1.codepot-config.types';

import { writePackage } from './write-package';
import { writeFiles, type WriteFilesOptions, type WriteFilesResult } from './write-files';

export interface WriteCodepotPackageOptions extends WriteFilesOptions {}

export async function writeCodepotPackage(config: CodepotConfig, options: WriteCodepotPackageOptions = {}): Promise<WriteFilesResult> {
  const packageWriteResult = writePackage(config);

  return writeFiles(packageWriteResult, options);
}
