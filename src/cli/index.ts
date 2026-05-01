#!/usr/bin/env node

/**
 * Tempura CLI
 *
 * Main entry point for the Tempura command-line interface.
 * Provides commands for initializing, generating, checking, and rolling back entity files.
 */

import { Command } from 'commander';
import { createInitCommand } from './commands/init.command';
import { createGenerateCommand } from './commands/generate.command';
import { createCheckCommand } from './commands/check.command';
import { createRollbackCommand } from './commands/rollback.command';
import { createCleanCommand } from './commands/clean.command';

/**
 * Creates and configures the Tempura CLI program
 */
function createProgram(): Command {
  const program = new Command();

  program.name('tempura').description('Tempura - NestJS entity generation tool').version('0.1.0');

  // Register commands
  program.addCommand(createInitCommand());
  program.addCommand(createGenerateCommand());
  program.addCommand(createCheckCommand());
  program.addCommand(createRollbackCommand());
  program.addCommand(createCleanCommand());

  return program;
}

/**
 * Main entry point
 */
async function main() {
  const program = createProgram();
  await program.parseAsync(process.argv);
}

// Run the CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
