/**
 * Tempurify Default Configuration
 *
 * Provides default values for all Tempurify configuration options.
 * These defaults are merged with user configuration.
 */

import type { TempurifyConfig } from './config.types';
import { resolve } from 'node:path';

/**
 * Default Tempurify configuration (user-facing, relative paths only)
 */
export const DEFAULT_TEMPURA_CONFIG: TempurifyConfig = {
  project: {
    sourceDir: 'src',
    typesDir: 'types',
  },

  entity: {
    strategy: 'grouped',
    groupPattern: '*',
    entityFolderPattern: '*',
  },

  nest: {
    modulesDir: 'src/modules',
    entityFolderPattern: '**/*',
    typesFilePattern: '*.types.ts',
    configFilePattern: '*.config.ts',
    generatedDirName: '__generated__',
    customDirName: 'custom',
  },

  paths: {
    tempurifyDir: '.tempurify',
    manifestFile: '.tempurify/manifest.json',
    cacheDir: '.tempurify/cache',
    backupsDir: '.tempurify/backups',
  },

  templates: {
    builtinDir: 'templates/nest',
    userDir: 'tempurify.templates',
    allowUserOverrides: false,
  },

  immutable: {
    enabled: true,
    include: ['**/__generated__/**/*.ts'],
  },

  mutable: {
    include: ['**/custom/**/*.ts'],
  },

  formatting: {
    prettier: true,
    eslint: false,
    tsc: true,
  },

  git: {
    enabled: true,
    requiredBranch: null,
    preventDirtyCheckout: true,
  },
};

/**
 * Creates a default Tempurify configuration with resolved paths
 *
 * @param rootDir - Root directory to resolve paths from (defaults to process.cwd())
 * @returns Default configuration with absolute paths
 */
export function createDefaultTempurifyConfig(rootDir: string = process.cwd()): TempurifyConfig {
  const config = { ...DEFAULT_TEMPURA_CONFIG };

  // Add rootDir to project config (internal only, not in user config)
  if (config.project) {
    (config.project as any).rootDir = resolve(rootDir);
  }

  return config;
}
