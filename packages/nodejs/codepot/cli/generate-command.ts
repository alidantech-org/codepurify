import { CodePot } from '@/index';
import { createLogger } from '@/utils/logger/logging/create-logger';
import { LogLevel } from '@/utils/logger/logging/log-level';
import { getDryRun, getOutDir, loggerConfigFromCliArgs, type ParsedCliArgs } from './cli-args';
import { CliMessage } from './cli.constants';
import { loadPackageConfig } from './load-package-config';

export async function runGenerateCommand(args: ParsedCliArgs): Promise<number> {
  const cliLoggerConfig = loggerConfigFromCliArgs(args);

  const config = await loadPackageConfig();

  const logger = createLogger({ level: cliLoggerConfig.level ?? LogLevel.normal });

  const codepot = new CodePot();

  try {
    const result = await codepot.generate({
      definition: config,
      dryRun: getDryRun(args),
      outDir: getOutDir(args),
    });

    if (!result.success) {
      logger.error('Generation failed');
      console.error(result.error);
      return 1;
    }

    if (result.files) {
      for (const file of result.files) {
        console.log(CliMessage.generated(file.filePath));
      }
    }

    console.log(CliMessage.done);
    return 0;
  } catch (error) {
    logger.error('Generation failed');
    console.error(CliMessage.failed, error);
    return 1;
  }
}
