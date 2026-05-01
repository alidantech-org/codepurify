/**
 * Tempura Rollback Command
 *
 * Restores files from the latest backup session.
 */

import { Command } from 'commander';
import { intro, outro, confirm, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { join } from 'node:path';
import { rollback } from '../../core/generator';
import { fileExists } from '../../utils';
import { BackupManager } from '../../core/backup-manager';

/**
 * Creates the rollback command
 */
export function createRollbackCommand(): Command {
  const command = new Command('rollback')
    .description('Rollback to the latest backup session')
    .option('-f, --force', 'Force rollback without confirmation')
    .action(async (options) => {
      try {
        intro('🔄 Tempura Rollback');

        const rootDir = process.cwd();
        const backupsDir = join(rootDir, '.tempura', 'backups');

        // Check if backups exist
        if (!(await fileExists(backupsDir))) {
          consola.error('No backup sessions found');
          outro('Nothing to rollback');
          return;
        }

        // List backup sessions
        const s = spinner();
        s.start('Loading backup sessions');

        const backupManager = new BackupManager(backupsDir);
        const sessions = await backupManager.listSessions();

        s.stop(`Found ${sessions.length} backup sessions`);

        if (sessions.length === 0) {
          consola.warn('No backup sessions available');
          outro('Nothing to rollback');
          return;
        }

        // Show latest session
        const latestSession = sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        consola.info('Latest backup session:');
        consola.info(`  ID: ${latestSession.id}`);
        consola.info(`  Created: ${latestSession.createdAt}`);
        consola.info(`  Files: ${latestSession.records.length}`);

        // Confirm rollback
        if (!options.force) {
          const shouldContinue = await confirm({
            message: 'Rollback to this session?',
          });

          if (!shouldContinue) {
            outro('Rollback cancelled');
            return;
          }
        }

        // Perform rollback
        s.start('Rolling back files');

        await rollback(rootDir);

        s.stop('Rollback complete');

        consola.success('Rollback completed successfully!');
        consola.info(`Restored session: ${latestSession.id}`);

        outro('✨ Rollback complete');
      } catch (error) {
        consola.error('Rollback failed:', error);
        process.exit(1);
      }
    });

  return command;
}
