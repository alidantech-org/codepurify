/**
 * Tempurify Default Configuration
 *
 * Provides default values for all Tempurify configuration options.
 * These defaults are merged with user configuration.
 */
import type { TempurifyConfig } from '../types/config.types';

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
