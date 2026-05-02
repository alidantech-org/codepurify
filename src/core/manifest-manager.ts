/**
 * Codepurify Manifest Manager
 *
 * Manages the .codepurify/manifest.json file that tracks all generated files.
 * Provides CRUD operations for manifest entries with validation.
 */

import { z } from 'zod';
import { readJsonFile, writeJsonFile } from '../utils/json';
import { createCodepurifyError, CodepurifyErrorCode } from './errors';
import { logger } from './logger';

/**
 * Individual manifest entry for a generated file
 */
export interface CodepurifyManifestEntry {
  /** Relative file path (POSIX format) */
  path: string;
  /** Absolute file path */
  absolutePath: string;
  /** Source file that generated this file */
  source: string;
  /** Template used to generate this file */
  template: string;
  /** Content hash */
  hash: string;
  /** Whether this file is immutable */
  immutable: boolean;
  /** When this file was generated */
  generatedAt: string;
}

/**
 * Complete manifest structure
 */
export interface CodepurifyManifest {
  /** Manifest version */
  version: 1;
  /** Generator name */
  generator: 'codepurify';
  /** When generation occurred */
  generatedAt: string | null;
  /** All manifest entries */
  entries: CodepurifyManifestEntry[];
}

/**
 * Zod schema for manifest entry validation
 */
const manifestEntrySchema = z.object({
  path: z.string(),
  absolutePath: z.string(),
  source: z.string(),
  template: z.string(),
  hash: z.string(),
  immutable: z.boolean(),
  generatedAt: z.string(),
});

/**
 * Zod schema for manifest validation
 */
const manifestSchema = z.object({
  version: z.literal(1),
  generator: z.literal('codepurify'),
  generatedAt: z.string().nullable(),
  entries: z.array(manifestEntrySchema),
});

/**
 * Manages Codepurify manifest operations
 */
export class ManifestManager {
  constructor(private manifestFile: string) {}

  /**
   * Loads the manifest from disk
   *
   * @returns Loaded manifest or empty manifest if file doesn't exist
   * @throws CodepurifyError if manifest is invalid
   */
  async load(): Promise<CodepurifyManifest> {
    try {
      const manifest = await readJsonFile<CodepurifyManifest>(this.manifestFile);

      if (!manifest) {
        logger.debug('Manifest file not found, creating empty manifest');
        return this.createEmpty();
      }

      // Validate manifest structure
      const validated = manifestSchema.parse(manifest);
      logger.debug(`Loaded manifest with ${validated.entries.length} entries`);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createCodepurifyError(CodepurifyErrorCode.MANIFEST_INVALID, 'Manifest file has invalid structure', {
          errors: error.errors,
          file: this.manifestFile,
        });
      }

      throw createCodepurifyError(CodepurifyErrorCode.MANIFEST_INVALID, 'Failed to load manifest file', {
        file: this.manifestFile,
        cause: error,
      });
    }
  }

  /**
   * Saves the manifest to disk
   *
   * @param manifest - Manifest to save
   * @throws CodepurifyError if save fails
   */
  async save(manifest: CodepurifyManifest): Promise<void> {
    try {
      // Validate before saving
      const validated = manifestSchema.parse(manifest);
      await writeJsonFile(this.manifestFile, validated);
      logger.debug(`Saved manifest with ${validated.entries.length} entries`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createCodepurifyError(CodepurifyErrorCode.MANIFEST_INVALID, 'Cannot save manifest with invalid structure', {
          errors: error.errors,
        });
      }

      throw createCodepurifyError(CodepurifyErrorCode.MANIFEST_INVALID, 'Failed to save manifest file', {
        file: this.manifestFile,
        cause: error,
      });
    }
  }

  /**
   * Creates an empty manifest
   *
   * @returns Empty manifest structure
   */
  createEmpty(): CodepurifyManifest {
    return {
      version: 1,
      generator: 'codepurify',
      generatedAt: null,
      entries: [],
    };
  }

  /**
   * Gets a specific manifest entry by file path
   *
   * @param filePath - File path to look up
   * @returns Manifest entry or null if not found
   */
  async getEntry(filePath: string): Promise<CodepurifyManifestEntry | null> {
    const manifest = await this.load();
    const entry = manifest.entries.find((entry) => entry.path === filePath);
    return entry || null;
  }

  /**
   * Inserts or updates a manifest entry
   *
   * @param entry - Entry to upsert
   * @throws CodepurifyError if operation fails
   */
  async upsertEntry(entry: CodepurifyManifestEntry): Promise<void> {
    const manifest = await this.load();

    // Remove existing entry if present
    manifest.entries = manifest.entries.filter((e) => e.path !== entry.path);

    // Add new entry
    manifest.entries.push(entry);

    // Update generation timestamp
    manifest.generatedAt = new Date().toISOString();

    await this.save(manifest);
    logger.debug(`Upserted manifest entry for: ${entry.path}`);
  }

  /**
   * Removes a manifest entry by file path
   *
   * @param filePath - File path to remove
   * @throws CodepurifyError if operation fails
   */
  async removeEntry(filePath: string): Promise<void> {
    const manifest = await this.load();
    const initialCount = manifest.entries.length;

    manifest.entries = manifest.entries.filter((entry) => entry.path !== filePath);

    if (manifest.entries.length < initialCount) {
      manifest.generatedAt = new Date().toISOString();
      await this.save(manifest);
      logger.debug(`Removed manifest entry for: ${filePath}`);
    }
  }

  /**
   * Lists all manifest entries
   *
   * @returns Array of all manifest entries
   */
  async listEntries(): Promise<CodepurifyManifestEntry[]> {
    const manifest = await this.load();
    return manifest.entries;
  }
}
