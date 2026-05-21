#!/usr/bin/env node

import { CliCommand } from "./cli.constants.js";
import { runGenerateCommand } from "./generate-command.js";
import { runInitCommand } from "./init-command.js";

async function main(): Promise<void> {
  const command = process.argv[2] ?? CliCommand.help;

  if (command === CliCommand.init) {
    process.exit(await runInitCommand());
  }

  if (command === CliCommand.generate) {
    process.exit(await runGenerateCommand());
  }

  printHelp();
  process.exit(0);
}

function printHelp(): void {
  console.log(
    [
      "openapi-ts",
      "",
      "Commands:",
      "  init       Create package.config.ts",
      "  generate   Generate OpenAPI files from package.config.ts",
      "",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
