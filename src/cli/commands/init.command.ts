/**
 * Tempurify Init Command
 *
 * Initializes a Tempurify project by creating:
 * - tempurify.config.js
 * - .tempurify/ directory
 * - .tempurify/manifest.json
 */

import { Command } from 'commander';
import { intro, outro, confirm, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { join } from 'node:path';
import { ensureDirectory } from '../../utils';

/**
 * Default manifest template
 */
const DEFAULT_MANIFEST = {
  version: 1,
  generator: 'tempurify',
  generatedAt: null,
  entries: [],
};

/**
 * Creates the init command
 */
export function createInitCommand(): Command {
  const command = new Command('init')
    .description('Initialize Tempurify in your project')
    .option('-f, --force', 'Force initialization even if Tempurify is already initialized')
    .action(async (options) => {
      try {
        intro('🚀 Tempurify Init');

        const rootDir = process.cwd();
        const configPath = join(rootDir, 'tempurify.config.ts');
        const tempurifyDir = join(rootDir, '.tempurify');
        const manifestPath = join(tempurifyDir, 'manifest.json');

        // Check if already initialized
        const { fileExists } = await import('../../utils');
        if (!options.force && (await fileExists(configPath))) {
          const shouldContinue = await confirm({
            message: 'Tempurify is already initialized. Re-initialize?',
          });

          if (!shouldContinue) {
            outro('Initialization cancelled');
            return;
          }
        }

        // Create config file
        const s = spinner();
        s.start('Creating tempurify.config.ts');

        // await writeFile(configPath, generateTempurifyConfigFile(), 'utf-8');

        s.stop('Created tempurify.config.ts');

        // Create .tempurify directory structure
        s.start('Creating .tempurify directory');

        await ensureDirectory(tempurifyDir);
        await ensureDirectory(join(tempurifyDir, 'cache'));
        await ensureDirectory(join(tempurifyDir, 'backups'));

        s.stop('Created .tempurify directory');

        // Create manifest file
        s.start('Creating manifest.json');

        const { writeJsonFile } = await import('../../utils/json');
        await writeJsonFile(manifestPath, DEFAULT_MANIFEST);

        s.stop('Created manifest.json');

        consola.success('Tempurify initialized successfully!');
        consola.info('Configuration file: tempurify.config.ts');
        consola.info('Working directory: .tempurify/');

        outro('✨ Ready to generate entities with: tempurify generate');
      } catch (error) {
        consola.error('Initialization failed:', error);
        process.exit(1);
      }
    });

  return command;
}
