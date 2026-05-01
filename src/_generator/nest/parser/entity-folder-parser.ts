import { readdir, access } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import { Project, Node } from 'ts-morph';
import { loadTempuraConfig } from '../../../config/config-loader';

/**
 * Discovered entity folder information
 */
export interface DiscoveredEntityFolder {
  /** Entity name from folder name */
  entityName: string;
  /** Full path to entity folder */
  folderPath: string;
  /** Path to types file */
  typesFilePath: string;
  /** Path to config file */
  configFilePath: string;
}

/**
 * Discover valid Tempura entity folders
 *
 * Scans config.nest.modulesDir to find folders containing both:
 * - *.types.ts
 * - *.config.ts
 *
 * @param config - Tempura configuration
 * @returns Promise<DiscoveredEntityFolder[]> - Array of discovered entity folders
 * @throws Error if folder structure is invalid
 */
export async function discoverEntityFolders(config?: any): Promise<DiscoveredEntityFolder[]> {
  const tempuraConfig = config || (await loadTempuraConfig());
  const modulesDir = tempuraConfig.nest?.modulesDir || 'src/app';

  const ignoredDirs = new Set(['__generated__', 'custom', 'node_modules', 'dist']);
  const discoveredFolders: DiscoveredEntityFolder[] = [];

  async function scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !ignoredDirs.has(entry.name)) {
          const fullPath = join(dirPath, entry.name);
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const parentDir = join(dirPath, '..');
          const folderName = basename(parentDir);

          // Skip if this is an ignored directory
          if (ignoredDirs.has(folderName)) continue;

          // Check if this file matches our patterns
          const fileName = entry.name;
          const ext = extname(fileName);
          const baseName = fileName.slice(0, -ext.length);

          if (ext === '.ts') {
            if (baseName.includes('.types')) {
              // Found a types file, check for corresponding config file
              const configPattern = baseName.replace('.types', '.config') + '.ts';
              const configPath = join(dirPath, configPattern);

              try {
                await access(configPath);
                // Both files exist, this is a valid entity folder
                const entityFolder: DiscoveredEntityFolder = {
                  entityName: folderName,
                  folderPath: parentDir,
                  typesFilePath: join(dirPath, fileName),
                  configFilePath: configPath,
                };

                // Check for duplicates
                const existing = discoveredFolders.find((f) => f.entityName === folderName);
                if (existing) {
                  console.warn(`Warning: Multiple entity folders found for entity '${folderName}'. Using first one.`);
                } else {
                  discoveredFolders.push(entityFolder);
                }
              } catch {
                // Config file doesn't exist, skip
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
    }
  }

  await scanDirectory(modulesDir);

  // Sort results by entity name
  discoveredFolders.sort((a, b) => a.entityName.localeCompare(b.entityName));

  return discoveredFolders;
}
