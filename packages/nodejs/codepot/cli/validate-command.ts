// import fs from 'fs';
// import path from 'path';
// import { loggerConfigFromCliArgs, type ParsedCliArgs } from './cli-args';
// import { resolvePackageConfig } from '@/index';
// import { validateOpenApiFile } from '@/pipeline/targets/openapi/validator/validate-openapi-document';
// import { createLogger } from '@/utils/logger/logging/create-logger';
// import { LogLevel } from '@/utils/logger/logging/log-level';
// import { loadPackageConfig } from './load-package-config';

// export async function runValidateCommand(args: ParsedCliArgs): Promise<number> {
//   const cliLoggerConfig = loggerConfigFromCliArgs(args);
//   const bootstrapLogger = createLogger({ level: LogLevel.silent });

//   try {
//     const config = await loadPackageConfig();
//     const resolvedConfig = resolvePackageConfig(config);

//     const logger = createLogger({ level: cliLoggerConfig.level ?? LogLevel.normal });

//     // Find the generated OpenAPI JSON file
//     const outputFolder = resolvedConfig.output.folder;
//     const filePrefix = resolvedConfig.output.filePrefix;
//     const contractVersion = config.contracts[0]?.version ?? 'v1';
//     const jsonFileName = `${filePrefix}.${contractVersion}.json`;
//     const jsonPath = path.join(outputFolder, jsonFileName);

//     if (!fs.existsSync(jsonPath)) {
//       logger.error('OpenAPI file not found');
//       console.error(`OpenAPI file not found: ${jsonPath}`);
//       console.error('Run "codepot generate" first.');
//       return 1;
//     }

//     const validationTask = logger.task(`Validating ${jsonPath}`);
//     const result = await validateOpenApiFile(jsonPath, resolvedConfig.validation);

//     if (!result.valid) {
//       validationTask.fail();
//       logger.error('Validation failed');
//       console.error(result.output ?? result.errors.join('\n'));
//       return 1;
//     }

//     validationTask.succeed(`Validated ${jsonPath}`);

//     if (result.warnings && result.warnings.length > 0) {
//       logger.warn('Validation passed with warnings ignored');
//       for (const warning of result.warnings) {
//         console.log(`  ${warning}`);
//       }
//     }

//     return 0;
//   } catch (error) {
//     bootstrapLogger.error('Validation failed');
//     console.error(error);
//     return 1;
//   }
// }
