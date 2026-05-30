#!/usr/bin/env node

import { CliCommand } from './cli.constants';
import { parseCliArgs } from './cli-args';
import { runBuildCommand } from './commands/build';
import { runInspectCommand } from './commands/inspect';
// import { runInitCommand } from './init-command';
// import { runValidateCommand } from './validate-command';

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.command === CliCommand.build) {
    try {
      await runBuildCommand({
        config: args.values.get('config') || args.values.get('c'),
        dryRun: args.flags.has('dry-run'),
      });
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  if (args.command === CliCommand.inspect) {
    try {
      await runInspectCommand({
        config: args.values.get('config') || args.values.get('c'),
      });
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  // if (args.command === CliCommand.init) {
  //   process.exit(await runInitCommand(args));
  // }

  // if (args.command === CliCommand.validate) {
  //   process.exit(await runValidateCommand(args));
  // }

  printHelp();
  process.exit(0);
}

function printHelp(): void {
  console.log(
    [
      'codepot',
      '',
      'Commands:',
      '  build      Compile and write Codepot IR files',
      '  inspect    Inspect compiled Codepot contracts',
      // '  init       Create codepot.config.ts',
      // '  validate   Validate generated files',
      '',
      'Options:',
      '  -c, --config <path>  Path to config file (default: examples/codepot.config.example.ts)',
      '  --dry-run             Plan files without writing',
      '',
    ].join('\n'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
