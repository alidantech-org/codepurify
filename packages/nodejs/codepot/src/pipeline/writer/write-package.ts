// src/pipeline/writer/write-package.ts

import type { CodepotConfig, CodepotOutputFormat } from '@/contract/types/core/1.codepot-config.types';

import type { CodepotDefinition } from '@/contract/types/definition';

import { compilePackage } from '@/pipeline/compiler/compile-package';
import { writeCodepotJson } from './write-json';
import { writeCodepotYaml } from './write-yaml';

export interface PackageWriteFile {
  readonly path: string;
  readonly content: string;
}

export interface PackageWriteResult {
  readonly files: readonly PackageWriteFile[];
}

function joinPath(...parts: readonly string[]): string {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '');
}

function extensionForFormat(format: CodepotOutputFormat): string {
  if (format === 'json') return 'json';
  return 'yaml';
}

function writeDefinition(definition: CodepotDefinition, format: CodepotOutputFormat): string {
  if (format === 'json') return writeCodepotJson(definition);
  return writeCodepotYaml(definition);
}

export function writePackage(config: CodepotConfig): PackageWriteResult {
  const compiled = compilePackage(config);

  const outputFolder = config.output?.folder ?? 'dist';
  const baseName = config.output?.baseName ?? 'codepot';
  const formats = config.output?.formats ?? ['json'];

  const files = compiled.contracts.flatMap((definition) =>
    formats.map((format) => {
      const extension = extensionForFormat(format);
      const fileName = `${baseName}.v${definition.version}.${extension}`;

      return {
        path: joinPath(outputFolder, fileName),
        content: writeDefinition(definition, format),
      };
    }),
  );

  return {
    files,
  };
}
