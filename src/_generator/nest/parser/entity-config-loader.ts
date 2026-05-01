import { createJiti } from 'jiti';
import { basename } from 'node:path';
import { logger } from '../../../core/logger';
import { convertToParsedConfig } from './config-parser';
import type { ParsedEntityConfig, LoadedEntityConfig } from './config-parser';

/**
 * Load entity configuration file as executable module
 *
 * This loads the config file using jiti to properly resolve
 * imports, spreads, and computed values that AST parsing cannot handle.
 *
 * @param configFilePath - Absolute path to entity config file
 * @returns Promise<LoadedEntityConfig> - Loaded configuration
 * @throws Error if required exports are missing
 */
export async function loadEntityConfigFile(configFilePath: string): Promise<LoadedEntityConfig> {
  logger.debug(`Loading entity config module: ${configFilePath}`);

  // Use jiti to load config as executable module
  const jiti = createJiti(configFilePath);

  try {
    const mod = await jiti.import(configFilePath);
    const moduleExports = Object.keys(mod as object) as string[];

    logger.debug(`Resolved config exports: ${moduleExports.join(', ')}`);

    // Determine export names based on file name
    const fileName = basename(configFilePath, '.config.ts');
    const entityName = fileName.toUpperCase();

    const expectedExports = {
      fieldsExportName: `${entityName}_FIELDS`,
      metaExportName: `${entityName}_META`,
      dbExportName: `${entityName}_DB`,
    };

    // Validate required exports
    for (const [exportType, exportName] of Object.entries(expectedExports)) {
      if (!moduleExports.includes(exportName)) {
        throw new Error(`Missing ${exportName} export in ${configFilePath}`);
      }
    }

    // Load actual exports
    const fields = (mod as any)[expectedExports.fieldsExportName];
    const meta = (mod as any)[expectedExports.metaExportName];
    const db = (mod as any)[expectedExports.dbExportName];

    // Validate loaded values
    if (!fields) {
      throw new Error(`${expectedExports.fieldsExportName} is not exported from ${configFilePath}`);
    }
    if (!meta) {
      throw new Error(`${expectedExports.metaExportName} is not exported from ${configFilePath}`);
    }
    if (!db) {
      throw new Error(`${expectedExports.dbExportName} is not exported from ${configFilePath}`);
    }

    logger.debug(`Using fields export: ${expectedExports.fieldsExportName}`);
    logger.debug(`Using meta export: ${expectedExports.metaExportName}`);
    logger.debug(`Using db export: ${expectedExports.dbExportName}`);

    return {
      fields,
      meta,
      db,
      exportNames: expectedExports,
    };
  } catch (error) {
    throw new Error(`Failed to load entity config from ${configFilePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
