import { codepot } from '@/index';
import type { ParsedCliArgs } from './cli-args';
import { CliMessage } from './cli.constants';

export async function runInitCommand(args: ParsedCliArgs): Promise<number> {
  // TODO: Update CLI to use new codepot runtime API
  console.log('CLI not yet updated for new runtime API');
  return 0;
}
