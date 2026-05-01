import { readdir, access } from 'node:fs/promises';
import { join, basename, extname, resolve } from 'node:path';
import { Project, Node } from 'ts-morph';
import { loadTempurifyConfig } from '../../../config/config-loader';
import { TEMPURIFY_FILE_REGISTRY } from '../../../config/file-registry';
import { consola } from 'consola';

/**
 * Discovered entity folder information
 */
export interface DiscoveredEntityFolder {
  /** Strategy used for discovery */
  strategy: 'grouped';
  /** Group name from path */
  groupName: string;
  /** Entity name from folder name */
  entityName: string;
  /** Full path to entity folder */
  folderPath: string;
  /** Path to types file */
  typesFilePath: string;
  /** Path to config file */
  configFilePath: string;
  /** Path to context file (generated) */
  contextFilePath: string;
  /** Path to barrel file (generated) */
  barrelFilePath: string;
}

/**
 * Discover valid Tempurify entity folders using grouped strategy
 *
 * Scans config.project.typesDir to find entity folders following the pattern:
 * {typesDir}/{groupName}/{entityName}/
 * Each entity folder must contain:
 * - {entityName}.types.ts
 * - {entityName}.config.ts
 *
 * @param config - Tempurify configuration
 * @param debug - Enable debug output
 * @returns Promise<DiscoveredEntityFolder[]> - Array of discovered entity folders
 * @throws Error if folder structure is invalid
 */
export async function discoverEntityFolders(config?: any, debug: boolean = false): Promise<DiscoveredEntityFolder[]> {
  const tempurifyConfig = config || (await loadTempurifyConfig());

  // Get the types directory from project config
  const typesDir = tempurifyConfig.project?.typesDir || 'types';
  const rootDir = tempurifyConfig.project?.rootDir || process.cwd();
  const typesDirPath = resolve(rootDir, typesDir);
  const strategy = tempurifyConfig.entity?.strategy || 'grouped';

  if (debug) {
    consola.info(`typesDir: ${typesDirPath}`);
    consola.info(`strategy: ${strategy}`);
  }

  // Check if types directory exists
  try {
    await access(typesDirPath);
  } catch {
    consola.warn(`Types directory not found: ${typesDirPath}`);
    return [];
  }

  const ignoredDirs = new Set(['__generated__', 'custom', 'node_modules', 'dist']);
  const discoveredFolders: DiscoveredEntityFolder[] = [];

  async function scanGroupDirectory(groupPath: string, groupName: string): Promise<void> {
    try {
      const entries = await readdir(groupPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !ignoredDirs.has(entry.name)) {
          const entityPath = join(groupPath, entry.name);
          const entityName = entry.name;

          if (debug) {
            consola.info(`checking: ${groupName}/${entityName}`);
          }

          // Check for required files in entity folder
          const typesFileName = `${entityName}.types.ts`;
          const configFileName = `${entityName}.config.ts`;

          const typesFilePath = join(entityPath, typesFileName);
          const configFilePath = join(entityPath, configFileName);

          try {
            // Check if both required files exist
            await access(typesFilePath);
            await access(configFilePath);

            if (debug) {
              consola.info(`found: ${typesFileName}, ${configFileName}`);
            }

            // Both files exist, this is a valid entity folder
            const contextFileName = `${entityName}.context.ts`;
            const barrelFileName = 'index.ts';

            const entityFolder: DiscoveredEntityFolder = {
              strategy: 'grouped',
              groupName,
              entityName,
              folderPath: entityPath,
              typesFilePath,
              configFilePath,
              contextFilePath: join(entityPath, contextFileName),
              barrelFilePath: join(entityPath, barrelFileName),
            };

            discoveredFolders.push(entityFolder);
          } catch {
            // Missing required files, skip this folder
            if (debug) {
              consola.info(`missing required files in ${groupName}/${entityName}`);
            }
            continue;
          }
        }
      }
    } catch (error) {
      consola.warn(`Warning: Could not scan group directory ${groupPath}:`, error);
    }
  }

  async function scanTypesDirectory(): Promise<void> {
    try {
      const entries = await readdir(typesDirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !ignoredDirs.has(entry.name)) {
          const groupPath = join(typesDirPath, entry.name);
          const groupName = entry.name;
          await scanGroupDirectory(groupPath, groupName);
        }
      }
    } catch (error) {
      consola.warn(`Warning: Could not scan types directory ${typesDirPath}:`, error);
    }
  }

  await scanTypesDirectory();

  // Sort results by groupName then entityName
  discoveredFolders.sort((a, b) => {
    const groupCompare = a.groupName.localeCompare(b.groupName);
    if (groupCompare !== 0) return groupCompare;
    return a.entityName.localeCompare(b.entityName);
  });

  return discoveredFolders;
}
