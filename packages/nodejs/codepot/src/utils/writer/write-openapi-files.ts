import path from 'path';
import type { CompilerLogger } from '@/utils/logger/compiler-logger';
import { PackageOutputFormat } from '@/contract/config/package-config.types';
import { writeJsonFile } from './write-json-file';
import { writeYamlFile } from './write-yaml-file';
import { sanitizeDebugContract } from '@/app/debug/sanitize-debug-contract.js';
import { createDebugFileName, createOpenApiFileName } from '@/app/runtime/output/openapi-file-name';
import { ResolvedOutputConfig } from '@/app/runtime/output/output.types';
import { OpenApiDocument } from '@/pipeline/targets/openapi/options/openapi.types';

export interface WriteOpenApiFilesInput {
  readonly document: OpenApiDocument;
  readonly contractVersion: string;
  readonly contractDebug?: unknown;
  readonly output: ResolvedOutputConfig;
  readonly logger?: CompilerLogger;
}

export function writeOpenApiFiles(input: WriteOpenApiFilesInput): string[] {
  const written: string[] = [];

  input.logger?.detail('Write targets', {
    debugPath: input.output.folder,
    jsonPath: input.output.folder,
    yamlPath: input.output.folder,
    formats: input.output.formats,
  });

  if (input.contractDebug) {
    const debugPath = path.join(input.output.folder, createDebugFileName(input.output.debugFilePrefix, input.contractVersion));

    writeJsonFile(debugPath, sanitizeDebugContract(input.contractDebug));
    written.push(debugPath);
    input.logger?.detail(`Generated ${debugPath}`);
  }

  for (const format of input.output.formats) {
    const filePath = path.join(input.output.folder, createOpenApiFileName(input.output.filePrefix, input.contractVersion, format));

    if (format === PackageOutputFormat.json) {
      writeJsonFile(filePath, input.document);
    }

    if (format === PackageOutputFormat.yaml) {
      writeYamlFile(filePath, input.document);
    }

    written.push(filePath);
    input.logger?.detail(`Generated ${filePath}`);
  }

  return written;
}
