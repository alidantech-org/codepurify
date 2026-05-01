import type { TempurifyConfig } from './config.types';

export const defaultTempurifyConfigTemplate: TempurifyConfig = {
  project: {
    sourceDir: 'src',
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
    allowUserOverrides: true,
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
