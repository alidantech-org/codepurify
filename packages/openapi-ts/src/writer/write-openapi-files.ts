import path from "path";
import { PackageOutputFormat } from "../config/package-config.types.js";
import type { OpenApiDocument } from "../openapi/openapi.types.js";
import {
  createDebugFileName,
  createOpenApiFileName,
} from "../output/openapi-file-name";
import type { ResolvedOutputConfig } from "../output/output.types.js";
import { writeJsonFile } from "./write-json-file";
import { writeYamlFile } from "./write-yaml-file";

export interface WriteOpenApiFilesInput {
  readonly document: OpenApiDocument;
  readonly contractVersion: string;
  readonly contractDebug?: unknown;
  readonly output: ResolvedOutputConfig;
}

export function writeOpenApiFiles(input: WriteOpenApiFilesInput): string[] {
  const written: string[] = [];

  if (input.contractDebug) {
    const debugPath = path.join(
      input.output.folder,
      createDebugFileName(input.output.debugFilePrefix, input.contractVersion),
    );

    writeJsonFile(debugPath, input.contractDebug);
    written.push(debugPath);
  }

  for (const format of input.output.formats) {
    const filePath = path.join(
      input.output.folder,
      createOpenApiFileName(
        input.output.filePrefix,
        input.contractVersion,
        format,
      ),
    );

    if (format === PackageOutputFormat.json) {
      writeJsonFile(filePath, input.document);
    }

    if (format === PackageOutputFormat.yaml) {
      writeYamlFile(filePath, input.document);
    }

    written.push(filePath);
  }

  return written;
}
