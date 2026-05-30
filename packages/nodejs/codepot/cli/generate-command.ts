import { codepot } from '@/index';
import { createLogger } from '@/utils/logger/logging/create-logger';
import { LogLevel } from '@/utils/logger/logging/log-level';
import { getDryRun, getOutDir, loggerConfigFromCliArgs, type ParsedCliArgs } from './cli-args';
import { CliMessage } from './cli.constants';
import { loadPackageConfig } from './load-package-config';

export async function runGenerateCommand(args: ParsedCliArgs): Promise<number> {
  const cliLoggerConfig = loggerConfigFromCliArgs(args);

  const config = await loadPackageConfig();

  const logger = createLogger({ level: cliLoggerConfig.level ?? LogLevel.normal });

  // TODO: Update CLI to use new codepot runtime API
  // const runtime = codepot.createRuntime();
  // const result = await runtime.write(config, { dryRun: getDryRun(args) });

  console.log('CLI not yet updated for new runtime API');
  return 0;
}
