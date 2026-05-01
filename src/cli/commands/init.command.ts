/**
 * Tempura Init Command
 *
 * Initializes a Tempura project by creating:
 * - tempura.config.js
 * - .tempura/ directory
 * - .tempura/manifest.json
 */

import { Command } from 'commander';
import { intro, outro, confirm, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { join, resolve } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { ensureDirectory } from '../../utils';
import { DEFAULT_TEMPURA_CONFIG } from '../../config/config-defaults';

/**
 * Generates config file content from default config
 */
function generateConfigContent(): string {
  const config = DEFAULT_TEMPURA_CONFIG;

  return `/**
 * Tempura Configuration
 * 
 * Configure your NestJS entity generation settings.
 */

export default ${JSON.stringify(config, null, 2)};
`;
}

/**
 * Default manifest template
 */
const DEFAULT_MANIFEST = {
  version: 1,
  generator: 'tempura',
  generatedAt: null,
  entries: [],
};

/**
 * Creates the init command
 */
export function createInitCommand(): Command {
  const command = new Command('init')
    .description('Initialize Tempura in your project')
    .option('-f, --force', 'Force initialization even if Tempura is already initialized')
    .action(async (options) => {
      try {
        intro('🚀 Tempura Init');

        const rootDir = process.cwd();
        const configPath = join(rootDir, 'tempura.config.js');
        const tempuraDir = join(rootDir, '.tempura');
        const manifestPath = join(tempuraDir, 'manifest.json');

        // Check if already initialized
        const { fileExists } = await import('../../utils');
        if (!options.force && (await fileExists(configPath))) {
          const shouldContinue = await confirm({
            message: 'Tempura is already initialized. Re-initialize?',
          });

          if (!shouldContinue) {
            outro('Initialization cancelled');
            return;
          }
        }

        // Create config file
        const s = spinner();
        s.start('Creating tempura.config.js');

        await writeFile(configPath, generateConfigContent(), 'utf-8');

        s.stop('Created tempura.config.js');

        // Create .tempura directory structure
        s.start('Creating .tempura directory');

        await ensureDirectory(tempuraDir);
        await ensureDirectory(join(tempuraDir, 'cache'));
        await ensureDirectory(join(tempuraDir, 'backups'));

        s.stop('Created .tempura directory');

        // Create manifest file
        s.start('Creating manifest.json');

        const { writeJsonFile } = await import('../../utils/json');
        await writeJsonFile(manifestPath, DEFAULT_MANIFEST);

        s.stop('Created manifest.json');

        consola.success('Tempura initialized successfully!');
        consola.info('Configuration file: tempura.config.js');
        consola.info('Working directory: .tempura/');

        outro('✨ Ready to generate entities with: tempura generate');
      } catch (error) {
        consola.error('Initialization failed:', error);
        process.exit(1);
      }
    });

  return command;
}
