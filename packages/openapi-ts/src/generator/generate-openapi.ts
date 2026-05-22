import type { PackageConfig } from '../config/package-config.types.js';
import type { CompilerContext } from '../compiler/compiler-context.types.js';
import { CompilerLogger } from '../logger/compiler-logger.js';
import { resolvePackageConfig } from '../config/resolve-package-config.js';
import { compileOpenApi } from '../compiler/compile-openapi.js';
import { validateOpenApiFile } from '../validator/validate-openapi-document.js';
import { writeOpenApiFiles } from '../writer/write-openapi-files.js';

export interface GenerateOpenApiResult {
  readonly success: boolean;
  readonly files: string[];
  readonly error?: unknown;
}

export interface GenerateOpenApiOptions {
  readonly logger?: CompilerLogger;
}

export async function generateOpenApi(config: PackageConfig, options: GenerateOpenApiOptions = {}): Promise<GenerateOpenApiResult> {
  const logger = options.logger;
  const files: string[] = [];
  const resolvedConfig = resolvePackageConfig(config);

  if (resolvedConfig.contracts.length === 0) {
    return {
      success: false,
      files,
      error: 'No contracts found. Add at least one version contract to package.config.ts.',
    };
  }

  for (const version of resolvedConfig.contracts) {
    logger?.step(`Compiling ${version.contract.info.title} ${version.contract.info.version}`);

    const contractLogger = logger?.child({
      scope: 'contract',
      version: version.contract.info.version,
    });

    const context: CompilerContext = { logger: contractLogger ?? new CompilerLogger() };

    const compiled = compileOpenApi(version.contract, resolvedConfig.compile, context);

    if (!compiled.success) {
      return {
        success: false,
        files,
        error: compiled.issues,
      };
    }

    logger?.step('Writing OpenAPI files');

    files.push(
      ...writeOpenApiFiles({
        document: compiled.document,
        contractVersion: version.contract.info.version,
        contractDebug: version.contract,
        output: resolvedConfig.output,
        logger,
      }),
    );

    // Only validate if enabled
    if (resolvedConfig.validation.enabled !== false) {
      logger?.step('Validating OpenAPI');

      const jsonFileName = `${resolvedConfig.output.filePrefix}.${version.contract.info.version}.json`;
      const jsonPath = `${resolvedConfig.output.folder}/${jsonFileName}`;
      const validation = await validateOpenApiFile(jsonPath, resolvedConfig.validation);

      if (!validation.valid) {
        return {
          success: false,
          files,
          error: validation.errors.join('\n'),
        };
      }

      logger?.success(`Validated ${jsonPath}`);
    }
  }

  return {
    success: true,
    files,
  };
}
