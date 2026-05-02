/**
 * Tempurify Backup Manager
 *
 * Manages backup sessions for files before overwriting.
 * Creates timestamped backup sessions and tracks file changes.
 */

import { z } from 'zod';
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ensureDirectory, readJsonFile, writeJsonFile, hashFile, fileExists } from '../utils';
import { createTempurifyError, TempurifyErrorCode } from './errors';
import { logger } from './logger';

/**
 * Individual backup record for a file
 */
export interface BackupRecord {
  /** Original file path */
  originalPath: string;
  /** Backup file path */
  backupPath: string;
  /** Whether original file existed */
  existed: boolean;
  /** Hash of original file content */
  hashBefore: string | null;
}

/**
 * Complete backup session
 */
export interface BackupSession {
  /** Session identifier */
  id: string;
  /** When session was created */
  createdAt: string;
  /** All backup records in this session */
  records: BackupRecord[];
}

/**
 * Zod schema for backup record validation
 */
const backupRecordSchema = z.object({
  originalPath: z.string(),
  backupPath: z.string(),
  existed: z.boolean(),
  hashBefore: z.string().nullable(),
});

/**
 * Zod schema for backup session validation
 */
const backupSessionSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  records: z.array(backupRecordSchema),
});

/**
 * Manages backup sessions for file operations
 */
export class BackupManager {
  constructor(private backupsDir: string) {}

  /**
   * Creates a new backup session
   *
   * @returns New backup session
   * @throws TempurifyError if session creation fails
   */
  async createSession(): Promise<BackupSession> {
    const sessionId = this.generateSessionId();
    const session: BackupSession = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      records: [],
    };

    // Ensure session directory exists
    const sessionDir = this.getSessionDir(sessionId);
    await ensureDirectory(sessionDir);

    // Save session metadata
    await this.saveSession(session);

    logger.debug(`Created backup session: ${sessionId}`);
    return session;
  }

  /**
   * Backs up a file within a session
   *
   * @param session - Backup session
   * @param filePath - File path to backup
   * @returns Backup record
   * @throws TempurifyError if backup fails
   */
  async backupFile(session: BackupSession, filePath: string): Promise<BackupRecord> {
    const sessionDir = this.getSessionDir(session.id);
    const filesDir = join(sessionDir, 'files');
    await ensureDirectory(filesDir);

    // Check if original file exists
    const existed = await fileExists(filePath);
    let hashBefore: string | null = null;

    if (existed) {
      // Calculate hash of original file
      hashBefore = await hashFile(filePath);

      if (hashBefore === null) {
        throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Failed to hash existing file for backup', { filePath });
      }

      // Copy file to backup location
      const backupFileName = this.generateBackupFileName(filePath);
      const backupPath = join(filesDir, backupFileName);

      try {
        await copyFile(filePath, backupPath);
      } catch (error) {
        throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Failed to copy file to backup location', {
          filePath,
          backupPath,
          cause: error,
        });
      }
    }

    const record: BackupRecord = {
      originalPath: filePath,
      backupPath: existed ? join(filesDir, this.generateBackupFileName(filePath)) : '',
      existed,
      hashBefore,
    };

    // Add record to session
    session.records.push(record);

    logger.debug(`Backed up file: ${filePath} (existed: ${existed})`);
    return record;
  }

  /**
   * Saves a backup session to disk
   *
   * @param session - Session to save
   * @throws TempurifyError if save fails
   */
  async saveSession(session: BackupSession): Promise<void> {
    try {
      const sessionDir = this.getSessionDir(session.id);
      await ensureDirectory(sessionDir);

      const sessionFile = join(sessionDir, 'session.json');
      await writeJsonFile(sessionFile, session);

      logger.debug(`Saved backup session: ${session.id}`);
    } catch (error) {
      throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Failed to save backup session', {
        sessionId: session.id,
        cause: error,
      });
    }
  }

  /**
   * Loads a backup session from disk
   *
   * @param sessionId - Session ID to load
   * @returns Loaded session or null if not found
   * @throws TempurifyError if session is invalid
   */
  async loadSession(sessionId: string): Promise<BackupSession | null> {
    try {
      const sessionFile = join(this.getSessionDir(sessionId), 'session.json');
      const session = await readJsonFile<BackupSession>(sessionFile);

      if (!session) {
        return null;
      }

      // Validate session structure
      const validated = backupSessionSchema.parse(session);
      logger.debug(`Loaded backup session: ${sessionId}`);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Backup session has invalid structure', {
          errors: error.errors,
          sessionId,
        });
      }

      throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Failed to load backup session', { sessionId, cause: error });
    }
  }

  /**
   * Lists all backup sessions
   *
   * @returns Array of all backup sessions
   */
  async listSessions(): Promise<BackupSession[]> {
    // For now, return empty array - we'll implement directory scanning later
    // This is a placeholder to satisfy the interface
    logger.debug('Listing backup sessions (not fully implemented yet)');
    return [];
  }

  /**
   * Generates a unique session ID based on timestamp
   *
   * @returns Session ID
   */
  private generateSessionId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * Gets the directory path for a session
   *
   * @param sessionId - Session ID
   * @returns Session directory path
   */
  private getSessionDir(sessionId: string): string {
    return join(this.backupsDir, sessionId);
  }

  /**
   * Generates a backup file name for a given file path
   *
   * @param filePath - Original file path
   * @returns Backup file name
   */
  private generateBackupFileName(filePath: string): string {
    // Replace path separators with underscores and add timestamp
    const sanitized = filePath.replace(/[\\/]/g, '_');
    const timestamp = Date.now();
    return `${sanitized}_${timestamp}`;
  }
}
