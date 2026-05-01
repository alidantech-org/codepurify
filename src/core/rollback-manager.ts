/**
 * Tempura Rollback Manager
 *
 * Restores files from backup sessions and updates manifest accordingly.
 * Provides safe rollback functionality with proper cleanup.
 */

import { copyFile, unlink } from 'node:fs/promises';
import { createTempuraError, TempuraErrorCode } from './errors';
import { logger } from './logger';
import type { ManifestManager } from './manifest-manager';

/**
 * Options for rollback manager
 */
export interface RollbackManagerOptions {
  /** Backups directory */
  backupsDir: string;
  /** Manifest manager instance */
  manifestManager: ManifestManager;
}

/**
 * Manages rollback operations for backup sessions
 */
export class RollbackManager {
  constructor(private options: RollbackManagerOptions) {}

  /**
   * Rolls back files from a specific backup session
   *
   * @param sessionId - Session ID to rollback from
   * @throws TempuraError if rollback fails
   */
  async rollback(sessionId: string): Promise<void> {
    const { backupsDir, manifestManager } = this.options;

    // Load backup session
    const { BackupManager } = await import('./backup-manager');
    const backupManager = new BackupManager(backupsDir);

    const session = await backupManager.loadSession(sessionId);
    if (!session) {
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'Backup session not found', { sessionId });
    }

    logger.info(`Starting rollback from session: ${sessionId}`);

    let restoredCount = 0;
    let deletedCount = 0;

    // Process each backup record
    for (const record of session.records) {
      try {
        if (record.existed) {
          // Restore file from backup
          await this.restoreFile(record);
          restoredCount++;
        } else {
          // Delete generated file
          await this.deleteGeneratedFile(record);
          deletedCount++;
        }

        // Update manifest to remove or restore entry
        await this.updateManifestForRollback(manifestManager, record);
      } catch (error) {
        logger.error(`Failed to rollback file: ${record.originalPath}`, error);
        // Continue with other files, but we'll throw an error at the end
      }
    }

    logger.info(`Rollback completed: ${restoredCount} files restored, ${deletedCount} files deleted`);

    // If any files failed to rollback, throw an error
    const totalProcessed = restoredCount + deletedCount;
    const totalRecords = session.records.length;

    if (totalProcessed < totalRecords) {
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'Partial rollback completed - some files failed to rollback', {
        sessionId,
        totalRecords,
        processed: totalProcessed,
        restored: restoredCount,
        deleted: deletedCount,
      });
    }
  }

  /**
   * Rolls back from the latest backup session
   *
   * @throws TempuraError if no sessions exist or rollback fails
   */
  async rollbackLatest(): Promise<void> {
    const { backupsDir } = this.options;

    // Load backup manager to get sessions
    const { BackupManager } = await import('./backup-manager');
    const backupManager = new BackupManager(backupsDir);

    const sessions = await backupManager.listSessions();

    if (sessions.length === 0) {
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'No backup sessions found for rollback');
    }

    // Sort sessions by creation date (newest first)
    const sortedSessions = sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestSession = sortedSessions[0];
    logger.info(`Rolling back from latest session: ${latestSession.id}`);

    await this.rollback(latestSession.id);
  }

  /**
   * Restores a file from backup
   *
   * @param record - Backup record
   * @throws TempuraError if restore fails
   */
  private async restoreFile(record: { originalPath: string; backupPath: string }): Promise<void> {
    if (!record.backupPath) {
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'No backup path available for file restoration', {
        originalPath: record.originalPath,
      });
    }

    try {
      await copyFile(record.backupPath, record.originalPath);
      logger.debug(`Restored file: ${record.originalPath}`);
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'Failed to restore file from backup', {
        originalPath: record.originalPath,
        backupPath: record.backupPath,
        cause: error,
      });
    }
  }

  /**
   * Deletes a generated file
   *
   * @param record - Backup record
   */
  private async deleteGeneratedFile(record: { originalPath: string }): Promise<void> {
    try {
      await unlink(record.originalPath);
      logger.debug(`Deleted generated file: ${record.originalPath}`);
    } catch (error) {
      const fsError = error as NodeJS.ErrnoException;

      // If file doesn't exist, that's fine
      if (fsError.code === 'ENOENT') {
        logger.debug(`Generated file already deleted: ${record.originalPath}`);
        return;
      }

      // Otherwise, it's an error
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'Failed to delete generated file', {
        originalPath: record.originalPath,
        cause: error,
      });
    }
  }

  /**
   * Updates manifest for rollback operation
   *
   * @param manifestManager - Manifest manager
   * @param record - Backup record
   */
  private async updateManifestForRollback(
    manifestManager: ManifestManager,
    record: { originalPath: string; existed: boolean },
  ): Promise<void> {
    try {
      if (record.existed) {
        // File existed before generation, so we should remove it from manifest
        // since we're restoring the original
        await manifestManager.removeEntry(record.originalPath);
      } else {
        // File didn't exist before generation, so we should remove it from manifest
        // since we're deleting the generated file
        await manifestManager.removeEntry(record.originalPath);
      }
    } catch (error) {
      logger.warn(`Failed to update manifest for rollback: ${record.originalPath}`, error);
      // Don't throw here - the file operation was successful, manifest update is secondary
    }
  }
}
