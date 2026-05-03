/**
 * Codepurify Init Command
 *
 * Initializes a Codepurify project using the Codepurify API.
 */

import { Command } from 'commander';
import { intro, outro, confirm, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { Codepurify } from '@/api/codepurify';

/**
 * Creates the init command
 */
export function createInitCommand(): Command {
  const command = new Command('init')
    .description('Initialize Codepurify in your project')
    .option('-f, --force', 'Force initialization even if Codepurify is already initialized')
    .option('--dry-run', 'Show what would be created without writing files')
    .action(async (options) => {
      try {
        intro('🚀 Codepurify Init');

        const codepurify = new Codepurify();

        // Check if already initialized using Codepurify API
        if (!options.force) {
          try {
            const codepurify = new Codepurify();
            const configPath = 'codepurify.config.ts';
            const configExists = await codepurify.files.exists(configPath);

            if (configExists) {
              const shouldContinue = await confirm({
                message: 'Codepurify is already initialized. Re-initialize?',
              });

              if (!shouldContinue) {
                outro('Initialization cancelled');
                return;
              }
            }
          } catch {
            // Continue with initialization if check fails
          }
        }

        // Initialize using Codepurify API
        const s = spinner();
        s.start('Initializing Codepurify project...');

        const result = await codepurify.init({
          force: options.force,
          dryRun: options.dryRun,
        });

        s.stop('Project initialized successfully');

        if (options.dryRun) {
          consola.info('Dry run completed. Files that would be created:');
          result.createdFiles.forEach((file) => {
            consola.info(`  ✓ ${file.path}`);
          });
        } else {
          consola.success(`Codepurify initialized successfully!`);
          consola.info(`Created ${result.createdFiles.length} files`);

          result.createdFiles.forEach((file) => {
            consola.info(`  ✓ ${file.path}`);
          });

          if (result.skippedFiles.length > 0) {
            consola.warn(`Skipped ${result.skippedFiles.length} files:`);
            result.skippedFiles.forEach((file) => {
              consola.info(`  ⏭ ${file}`);
            });
          }
        }

        outro('✨ Ready to generate entities with: codepurify generate');
      } catch (error) {
        consola.error('Initialization failed:', error);
        process.exit(1);
      }
    });

  return command;
}
