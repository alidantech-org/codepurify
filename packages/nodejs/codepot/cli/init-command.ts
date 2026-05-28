import { CodePot } from '@/index';
import type { ParsedCliArgs } from './cli-args';
import { CliMessage } from './cli.constants';

export async function runInitCommand(args: ParsedCliArgs): Promise<number> {
  const api = new CodePot();
  const result = await api.initConfig();

  if (!result.success) {
    console.error(CliMessage.failed, result.error);
    return 1;
  }

  if (result.skipped && result.filePath) {
    console.log(CliMessage.skipped(result.filePath));
    return 0;
  }

  if (result.filePath) {
    console.log(CliMessage.initialized(result.filePath));
  }

  return 0;
}
