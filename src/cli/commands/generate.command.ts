/**
 * Codepurify Generate Command
 *
 * Generates entity files from discovered entity folders.
 * MVP: generates app.context.ts and index.ts only.
 */

import { Command } from 'commander';

/**
 * Creates the generate command
 */
export function createGenerateCommand(): Command {
  const command = new Command('generate').description('Generate entity files from discovered entity folders').action(async () => {
    // TODO: Implement generate command
  });

  return command;
}
