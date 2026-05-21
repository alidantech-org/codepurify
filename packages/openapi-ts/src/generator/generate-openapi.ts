import type { PackageConfig } from "../config/package-config.types.js";
import { resolvePackageConfig } from "../config/resolve-package-config.js";
import { compileOpenApi } from "../compiler/compile-openapi.js";
import { validateOpenApiDocument } from "../validator/validate-openapi-document.js";
import { writeOpenApiFiles } from "../writer/write-openapi-files.js";

export interface GenerateOpenApiResult {
  readonly success: boolean;
  readonly files: string[];
  readonly error?: unknown;
}

export async function generateOpenApi(
  config: PackageConfig,
): Promise<GenerateOpenApiResult> {
  const files: string[] = [];
  const resolvedConfig = resolvePackageConfig(config);

  if (resolvedConfig.contracts.length === 0) {
    return {
      success: false,
      files,
      error:
        "No contracts found. Add at least one version contract to package.config.ts.",
    };
  }

  for (const version of resolvedConfig.contracts) {
    const compiled = compileOpenApi(version.contract, resolvedConfig.compile);

    if (!compiled.success) {
      return {
        success: false,
        files,
        error: compiled.issues,
      };
    }

    const validation = await validateOpenApiDocument(compiled.document);

    if (!validation.valid) {
      return {
        success: false,
        files,
        error: validation.error,
      };
    }

    files.push(
      ...writeOpenApiFiles({
        document: compiled.document,
        contractVersion: version.contract.info.version,
        contractDebug: version.contract,
        output: resolvedConfig.output,
      }),
    );
  }

  return {
    success: true,
    files,
  };
}
