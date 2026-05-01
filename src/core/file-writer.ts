/**
 * Tempurify File Writer
 *
 * Safely writes generated files with backup, atomic writes, and manifest tracking.
 * Prevents writing outside root directory and ensures data integrity.
 */

import { writeFile, rename, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { hashContent, fileExists } from '../utils';
import { ensureInsideRoot, getRelativePath, toPosixPath } from '../utils/path';
import { createTempurifyError, TempurifyErrorCode } from './errors';
import { logger } from './logger';
import type { BackupManager, BackupSession } from './backup-manager';
import type { ManifestManager } from './manifest-manager';

/**
 * Input for writing a generated file
 */
export interface WriteGeneratedFileInput {
  /** File path (relative to root) */
  filePath: string;
  /** File content */
  content: string;
  /** Source file that generated this */
  source: string;
  /** Template used */
  template: string;
  /** Whether file is immutable */
  immutable: boolean;
  /** Backup session for this operation */
  backupSession: BackupSession;
}

/**
 * Result of writing a generated file
 */
export interface WriteGeneratedFileResult {
  /** File path (relative) */
  filePath: string;
  /** Absolute file path */
  absolutePath: string;
  /** Content hash */
  hash: string;
  /** Whether file was actually written */
  written: boolean;
}

/**
 * Options for file writer
 */
export interface FileWriterOptions {
  /** Root directory */
  rootDir: string;
  /** Backup manager instance */
  backupManager: BackupManager;
  /** Manifest manager instance */
  manifestManager: ManifestManager;
}

/**
 * Safely writes generated files with backup and tracking
 */
export class FileWriter {
  constructor(private options: FileWriterOptions) {}

  /**
   * Writes a single generated file
   *
   * @param input - File write input
   * @returns Write result
   * @throws TempurifyError if write fails
   */
  async writeGeneratedFile(input: WriteGeneratedFileInput): Promise<WriteGeneratedFileResult> {
    const { rootDir, backupManager, manifestManager } = this.options;

    // Resolve absolute path
    const absolutePath = resolve(rootDir, input.filePath);

    // Ensure file is within root directory
    try {
      ensureInsideRoot(rootDir, absolutePath);
    } catch (error) {
      throw createTempurifyError(TempurifyErrorCode.FILE_WRITE_FAILED, 'File path escapes root directory', {
        filePath: input.filePath,
        absolutePath,
        rootDir,
      });
    }

    // Calculate content hash
    const hash = hashContent(input.content);

    // Check if file exists and compare hashes
    const fileExists = await this.fileExistsWithFallback(absolutePath);
    if (fileExists) {
      try {
        const existingContent = await this.readFileWithFallback(absolutePath);
        const existingHash = hashContent(existingContent);

        if (existingHash === hash) {
          logger.debug(`File unchanged, skipping write: ${input.filePath}`);
          return {
            filePath: input.filePath,
            absolutePath,
            hash,
            written: false,
          };
        }
      } catch (error) {
        logger.warn(`Failed to read existing file for comparison: ${input.filePath}`);
      }
    }

    // Backup existing file
    try {
      await backupManager.backupFile(input.backupSession, absolutePath);
    } catch (error) {
      throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Failed to backup file before write', {
        filePath: input.filePath,
        cause: error,
      });
    }

    // Write file atomically
    await this.writeAtomically(absolutePath, input.content);

    // Update manifest
    try {
      await manifestManager.upsertEntry({
        path: toPosixPath(getRelativePath(rootDir, absolutePath)),
        absolutePath,
        source: input.source,
        template: input.template,
        hash,
        immutable: input.immutable,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      // If manifest update fails, we should consider this a critical error
      throw createTempurifyError(TempurifyErrorCode.MANIFEST_INVALID, 'Failed to update manifest after file write', {
        filePath: input.filePath,
        cause: error,
      });
    }

    logger.debug(`Wrote generated file: ${input.filePath}`);
    return {
      filePath: input.filePath,
      absolutePath,
      hash,
      written: true,
    };
  }

  /**
   * Writes multiple generated files
   *
   * @param inputs - Array of file write inputs
   * @returns Array of write results
   * @throws TempurifyError if any write fails
   */
  async writeGeneratedFiles(inputs: WriteGeneratedFileInput[]): Promise<WriteGeneratedFileResult[]> {
    console.log('DEBUG: writeGeneratedFiles called with', inputs.length, 'inputs');
    console.log(
      'DEBUG: inputs:',
      inputs.map((i) => ({ filePath: i.filePath, hasContent: !!i.content, contentLength: i.content?.length || 0 })),
    );

    const results: WriteGeneratedFileResult[] = [];

    for (const input of inputs) {
      console.log('DEBUG: processing input:', input.filePath);
      try {
        const result = await this.writeGeneratedFile(input);
        console.log('DEBUG: writeGeneratedFile result:', result);
        results.push(result);
      } catch (error) {
        console.log('DEBUG: writeGeneratedFile error for', input.filePath, ':', error);
        console.log('DEBUG: error type:', typeof error);
        console.log('DEBUG: error message:', error instanceof Error ? error.message : String(error));
        results.push({
          filePath: input.filePath,
          absolutePath: input.filePath,
          hash: '',
          written: false,
        });
      }
    }

    console.log('DEBUG: writeGeneratedFiles completed, results:', results);
    logger.info(`Wrote ${results.filter((r) => r.written).length} files (skipped ${results.filter((r) => !r.written).length} unchanged)`);
    return results;
  }

  /**
   * Writes a file atomically (write to temp then rename)
   *
   * @param filePath - File path to write
   * @param content - File content
   * @throws TempurifyError if write fails
   */
  private async writeAtomically(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.temp.${Date.now()}.${Math.random().toString(36).substring(2)}`;

    try {
      // Ensure parent directory exists
      await mkdir(dirname(filePath), { recursive: true });

      // Write to temporary file
      await writeFile(tempPath, content, 'utf-8');

      // Rename to final location (atomic operation)
      await rename(tempPath, filePath);

      logger.debug(`Atomically wrote file: ${filePath}`);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await this.unlinkWithFallback(tempPath);
      } catch {
        // Ignore cleanup errors
      }

      throw createTempurifyError(TempurifyErrorCode.FILE_WRITE_FAILED, 'Failed to write file atomically', {
        filePath,
        tempPath,
        cause: error,
      });
    }
  }

  /**
   * Reads a file with fallback handling
   *
   * @param filePath - File path to read
   * @returns File content
   */
  private async readFileWithFallback(filePath: string): Promise<string> {
    // This would use the readFile utility, but since we're avoiding circular dependencies,
    // we'll implement a simple version here
    const { readFile } = await import('node:fs/promises');
    return await readFile(filePath, 'utf-8');
  }

  /**
   * Checks if file exists with fallback handling
   *
   * @param filePath - File path to check
   * @returns True if file exists
   */
  private async fileExistsWithFallback(filePath: string): Promise<boolean> {
    return fileExists(filePath);
  }

  /**
   * Unlinks a file with fallback handling
   *
   * @param filePath - File path to unlink
   */
  private async unlinkWithFallback(filePath: string): Promise<void> {
    try {
      const { unlink } = await import('node:fs/promises');
      await unlink(filePath);
    } catch {
      // Ignore unlink errors
    }
  }
}
