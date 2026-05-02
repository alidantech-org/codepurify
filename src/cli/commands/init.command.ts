/**
 * Codepurify Init Command
 *
 * Initializes a Codepurify project by creating:
 * - codepurify.config.js
 * - .codepurify/ directory
 * - .codepurify/manifest.json
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
  generator: 'codepurify',
  generatedAt: null,
  entries: [],
};

/**
 * Creates the init command
 */
export function createInitCommand(): Command {
  const command = new Command('init')
    .description('Initialize Codepurify in your project')
    .option('-f, --force', 'Force initialization even if Codepurify is already initialized')
    .action(async (options) => {
      try {
        intro('🚀 Codepurify Init');

        const rootDir = process.cwd();
        const configPath = join(rootDir, 'codepurify.config.ts');
        const codepurifyDir = join(rootDir, '.codepurify');
        const manifestPath = join(codepurifyDir, 'manifest.json');

        // Check if already initialized
        const { fileExists } = await import('../../utils');
        if (!options.force && (await fileExists(configPath))) {
          const shouldContinue = await confirm({
            message: 'Codepurify is already initialized. Re-initialize?',
          });

          if (!shouldContinue) {
            outro('Initialization cancelled');
            return;
          }
        }

        // Create config file
        const s = spinner();
        s.start('Creating codepurify.config.ts');

        // await writeFile(configPath, generateCodepurifyConfigFile(), 'utf-8');

        s.stop('Created codepurify.config.ts');

        // Create .codepurify directory structure
        s.start('Creating .codepurify directory');

        await ensureDirectory(codepurifyDir);
        await ensureDirectory(join(codepurifyDir, 'cache'));
        await ensureDirectory(join(codepurifyDir, 'backups'));

        s.stop('Created .codepurify directory');

        // Create manifest file
        s.start('Creating manifest.json');

        const { writeJsonFile } = await import('../../utils/json');
        await writeJsonFile(manifestPath, DEFAULT_MANIFEST);

        s.stop('Created manifest.json');

        consola.success('Codepurify initialized successfully!');
        consola.info('Configuration file: codepurify.config.ts');
        consola.info('Working directory: .codepurify/');

        outro('✨ Ready to generate entities with: codepurify generate');
      } catch (error) {
        consola.error('Initialization failed:', error);
        process.exit(1);
      }
    });

  return command;
}
