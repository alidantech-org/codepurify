/**
 * Codepurify Default Configuration
 *
 * Provides default values for all Codepurify configuration options.
 * These defaults are merged with user configuration.
 */
import type { CodepurifyConfig } from '../types/config.types';

/**
 * Default Codepurify configuration (user-facing, relative paths only)
 */
export const DEFAULT_TEMPURA_CONFIG: CodepurifyConfig = {
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
    codepurifyDir: '.codepurify',
    manifestFile: '.codepurify/manifest.json',
    cacheDir: '.codepurify/cache',
    backupsDir: '.codepurify/backups',
  },

  templates: {
    builtinDir: 'templates/nest',
    userDir: 'codepurify.templates',
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
