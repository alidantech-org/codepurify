/**
 * Tempurify Clean Command
 *
 * Clears the .tempurify/cache directory.
 */

import { Command } from 'commander';
import { intro, outro, confirm, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { join } from 'node:path';
import { rm } from 'node:fs/promises';
import { fileExists } from '../../utils';

/**
 * Creates the clean command
 */
export function createCleanCommand(): Command {
  const command = new Command('clean')
    .description('Clear the .tempurify/cache directory')
    .option('-f, --force', 'Force clean without confirmation')
    .action(async (options) => {
      try {
        intro('🧹 Tempurify Clean');

        const rootDir = process.cwd();
        const cacheDir = join(rootDir, '.tempurify', 'cache');

        // Check if cache exists
        if (!(await fileExists(cacheDir))) {
          consola.warn('Cache directory does not exist');
          outro('Nothing to clean');
          return;
        }

        // Confirm clean
        if (!options.force) {
          const shouldContinue = await confirm({
            message: 'Clear the cache directory?',
          });

          if (!shouldContinue) {
            outro('Clean cancelled');
            return;
          }
        }

        // Perform clean
        const s = spinner();
        s.start('Clearing cache');

        await rm(cacheDir, { recursive: true, force: true });

        s.stop('Cache cleared');

        consola.success('Cache cleared successfully!');
        consola.info(`Removed: ${cacheDir}`);

        outro('✨ Clean complete');
      } catch (error) {
        consola.error('Clean failed:', error);
        process.exit(1);
      }
    });

  return command;
}
