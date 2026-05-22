import { loggerConfigFromCliArgs, type ParsedCliArgs } from './cli-args.js';
import { CompilerLogger } from '../logger/compiler-logger.js';
import { OpenApiTs } from '../api/openapi-ts.js';
import { CliMessage } from './cli.constants.js';
import { loadPackageConfig } from './load-package-config.js';

export async function runGenerateCommand(args: ParsedCliArgs): Promise<number> {
  const cliLoggerConfig = loggerConfigFromCliArgs(args);
  const bootstrapLogger = new CompilerLogger(cliLoggerConfig);

  bootstrapLogger.step('Loading package config');

  const config = await loadPackageConfig();

  const logger = new CompilerLogger({
    ...config.logging,
    ...cliLoggerConfig,
  });

  logger.success('Loaded package config');

  const api = new OpenApiTs();

  try {
    const result = await api.generate({ config, logger });

    if (!result.success) {
      logger.error('Generation failed');
      console.error(result.error);
      return 1;
    }

    for (const file of result.files) {
      console.log(CliMessage.generated(file));
    }

    console.log(CliMessage.done);
    return 0;
  } catch (error) {
    logger.error('Generation failed');
    console.error(CliMessage.failed, error);
    return 1;
  }
}
