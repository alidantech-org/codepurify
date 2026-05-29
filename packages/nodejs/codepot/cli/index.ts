#!/usr/bin/env node

import { CliCommand } from './cli.constants';
import { parseCliArgs } from './cli-args';
import { runGenerateCommand } from './generate-command';
import { runInitCommand } from './init-command';
// import { runValidateCommand } from './validate-command';

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.command === CliCommand.init) {
    process.exit(await runInitCommand(args));
  }

  if (args.command === CliCommand.generate) {
    process.exit(await runGenerateCommand(args));
  }

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
      '  init       Create package.config.ts',
      '  generate   Generate OpenAPI files from package.config.ts',
      // '  validate   Validate generated OpenAPI files',
      '',
      'Options:',
      '  --silent             Disable normal logs',
      '  --verbose            Show detailed compiler progress',
      '  --debug              Show heavy compiler diagnostics',
      '  --log-level <level>  silent | normal | verbose | debug',
      '',
    ].join('\n'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
