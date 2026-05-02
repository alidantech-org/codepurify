import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { logger } from './logger';

/**
 * Tempurify folder structure manager
 *
 * Manages the .tempurify folder structure including:
 * - .tempurify/manifest.json - Generation manifest
 * - .tempurify/context/ - Entity context and metadata
 * - .tempurify/cache/ - Cached data and temporary files
 */

export interface TempurifyFolderStructure {
  root: string;
  manifest: string;
  context: string;
  cache: string;
  entities: string;
}

/**
 * Gets the .tempurify folder structure for a project
 */
export function getTempurifyFolders(rootDir: string): TempurifyFolderStructure {
  const tempurifyDir = join(rootDir, '.tempurify');

  return {
    root: tempurifyDir,
    manifest: join(tempurifyDir, 'manifest.json'),
    context: join(tempurifyDir, 'context'),
    cache: join(tempurifyDir, 'cache'),
    entities: join(tempurifyDir, 'context', 'entities'),
  };
}

/**
 * Ensures the .tempurify folder structure exists
 */
export async function ensureTempurifyFolders(rootDir: string): Promise<TempurifyFolderStructure> {
  const folders = getTempurifyFolders(rootDir);

  // Create folders if they don't exist
  const foldersToCreate = [folders.root, folders.context, folders.cache, folders.entities];

  for (const folder of foldersToCreate) {
    if (!existsSync(folder)) {
      await mkdir(folder, { recursive: true });
      logger.debug(`Created folder: ${folder}`);
    }
  }

  // Ensure manifest.json exists
  if (!existsSync(folders.manifest)) {
    const defaultManifest = {
      version: 1,
      generator: 'tempurify',
      generatedAt: null,
      entries: [],
    };
    await writeFile(folders.manifest, JSON.stringify(defaultManifest, null, 2), 'utf-8');
    logger.debug(`Created manifest: ${folders.manifest}`);
  }

  return folders;
}

/**
 * Entity metadata structure for JSON files
 */
export interface EntityMetadata {
  /** Entity identifier */
  entityName: string;
  /** When this metadata was last updated */
  updatedAt: string;
  /** Entity folder path */
  folderPath: string;
  /** Entity names in different formats */
  names: {
    pascal: string;
    camel: string;
    kebab: string;
    snake: string;
  };
  /** File paths for generated files */
  files: {
    typesFile: string;
    contextFile: string;
    indexFile: string;
    [key: string]: string;
  };
  /** Export names */
  exports: {
    interfaceName: string;
    contextName: string;
    indexName: string;
    [key: string]: string;
  };
  /** Entity configuration */
  config: Record<string, any>;
  /** Field definitions */
  fields: {
    groups: {
      all: string[];
      filterable: string[];
      creatable: string[];
      updatable: string[];
    };
    metadata: Record<string, any>;
  };
  /** Relationship definitions */
  relations: {
    groups: {
      all: string[];
      hasMany: string[];
      hasOne: string[];
      belongsTo: string[];
    };
    metadata: Record<string, any>;
  };
  /** Generation status */
  generation: {
    lastGenerated?: string;
    filesGenerated: string[];
    errors?: string[];
  };
}

/**
 * Saves entity metadata to a JSON file
 */
export async function saveEntityMetadata(folders: TempurifyFolderStructure, entityName: string, metadata: EntityMetadata): Promise<void> {
  const metadataFile = join(folders.entities, `${entityName}.json`);
  await writeFile(metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
  logger.debug(`Saved entity metadata: ${metadataFile}`);
}

/**
 * Loads entity metadata from a JSON file
 */
export async function loadEntityMetadata(folders: TempurifyFolderStructure, entityName: string): Promise<EntityMetadata | null> {
  const metadataFile = join(folders.entities, `${entityName}.json`);

  if (!existsSync(metadataFile)) {
    return null;
  }

  try {
    const content = await readFile(metadataFile, 'utf-8');
    return JSON.parse(content) as EntityMetadata;
  } catch (error) {
    logger.error(`Failed to load entity metadata: ${metadataFile}`, error);
    return null;
  }
}

/**
 * Lists all entity metadata files
 */
export function listEntityMetadata(folders: TempurifyFolderStructure): string[] {
  if (!existsSync(folders.entities)) {
    return [];
  }

  try {
    const { readdirSync } = require('node:fs');
    const files = readdirSync(folders.entities);
    return files.filter((file: string) => file.endsWith('.json')).map((file: string) => file.replace('.json', ''));
  } catch (error) {
    logger.error(`Failed to list entity metadata: ${folders.entities}`, error);
    return [];
  }
}

/**
 * Updates the generation manifest
 */
export async function updateManifest(folders: TempurifyFolderStructure, entries: any[]): Promise<void> {
  const manifest = {
    version: 1,
    generator: 'tempurify',
    generatedAt: new Date().toISOString(),
    entries,
  };

  await writeFile(folders.manifest, JSON.stringify(manifest, null, 2), 'utf-8');
  logger.debug(`Updated manifest: ${folders.manifest}`);
}
