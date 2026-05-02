/**
 * Tempurify Generate Command
 *
 * Generates entity files from discovered entity folders.
 * MVP: generates app.context.ts and index.ts only.
 */

import { Command } from 'commander';
import { intro, outro, confirm, multiselect, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { join } from 'node:path';
import { generate } from '../../core/generator';
import { loadTempurifyConfig } from '../../config/config-loader';
import { fileExists } from '../../utils';

/**
 * Creates the generate command
 */
export function createGenerateCommand(): Command {
  const command = new Command('generate')
    .description('Generate entity files from discovered entity folders')
    .option('-f, --force', 'Force generation without confirmation')
    .option('--skip-backup', 'Skip backup before writing files')
    .option('--skip-manifest', 'Skip manifest update')
    .option('--debug', 'Enable debug output')
    .action(async (options) => {
      try {
        intro('🔨 Tempurify Generate');

        const rootDir = process.cwd();
        const configPath = join(rootDir, 'tempurify.config.ts');

        // Check if Tempurify is initialized
        if (!(await fileExists(configPath))) {
          consola.error('Tempurify is not initialized. Run: tempurify init');
          process.exit(1);
        }

        // Load config
        const s = spinner();
        s.start('Loading configuration');

        const config = await loadTempurifyConfig(rootDir);

        s.stop('Configuration loaded');

        // Discover entity folders
        s.start('Discovering entity folders');

        const entityFolders = await discoverEntityFolders(config, options.debug);

        s.stop(`Found ${entityFolders.length} entity folders`);

        if (entityFolders.length === 0) {
          consola.warn('No entity folders found');
          outro('Nothing to generate');
          return;
        }

        // Show discovered entities
        consola.info('Discovered entities:');
        entityFolders.forEach((folder) => {
          consola.info(`  - ${folder.entityName} (${folder.folderPath})`);
        });

        // Select entities to generate
        let selectedFolders = entityFolders;
        if (!options.force) {
          const selected = await multiselect({
            message: 'Select entities to generate',
            options: entityFolders.map((entity) => ({
              value: entity.folderPath,
              label: entity.entityName,
              hint: entity.folderPath,
            })),
          });

          if (typeof selected === 'symbol' || !selected || selected.length === 0) {
            outro('No entities selected');
            return;
          }

          selectedFolders = entityFolders.filter((folder) => selected.includes(folder.folderPath));
        }

        // Show files to be generated
        const filesToGenerate = selectedFolders.length * 3; // context + entity + index per entity
        consola.info(`Will generate ${filesToGenerate} files (${selectedFolders.length} entities × 3 files)`);

        // Confirm if destructive
        if (!options.force) {
          const shouldContinue = await confirm({
            message: 'Proceed with generation?',
          });

          if (!shouldContinue) {
            outro('Generation cancelled');
            return;
          }
        }

        // Run generation
        s.start('Generating files');

        const result = await generate({
          rootDir,
          configFile: configPath,
          entities: selectedFolders,
          contextOnly: false, // Generate context and entity files
          skipBackup: options.skipBackup,
          skipManifest: options.skipManifest,
        });

        s.stop(`Generated ${result.filesGenerated} files (skipped ${result.filesSkipped} unchanged)`);

        // Show summary
        consola.success('Generation completed successfully!');
        consola.info(`Files generated: ${result.filesGenerated}`);
        consola.info(`Files skipped: ${result.filesSkipped}`);
        if (result.backupSessionId) {
          consola.info(`Backup session: ${result.backupSessionId}`);
        }

        // Show generated files
        consola.info('Generated files:');
        result.filePlans.forEach((plan) => {
          consola.info(`  - ${plan.filePath}`);
        });

        outro('✨ Generation complete');
      } catch (error) {
        consola.error('Generation failed:', error);
        process.exit(1);
      }
    });

  return command;
}
