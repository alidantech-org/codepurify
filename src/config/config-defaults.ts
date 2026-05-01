/**
 * Tempura Default Configuration
 *
 * Provides default values for all Tempura configuration options.
 * These defaults are merged with user configuration.
 */

import type { TempuraConfig } from './config.types';
import { resolve } from 'node:path';

/**
 * Default Tempura configuration
 */
export const DEFAULT_TEMPURA_CONFIG: TempuraConfig = {
  project: {
    rootDir: process.cwd(),
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
    tempuraDir: '.tempura',
    manifestFile: '.tempura/manifest.json',
    cacheDir: '.tempura/cache',
    backupsDir: '.tempura/backups',
  },

  templates: {
    builtinDir: 'templates/nest',
    userDir: 'tempura.templates',
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

/**
 * Creates a default Tempura configuration with resolved paths
 *
 * @param rootDir - Root directory to resolve paths from (defaults to process.cwd())
 * @returns Default configuration with absolute paths
 */
export function createDefaultTempuraConfig(rootDir: string = process.cwd()): TempuraConfig {
  const config = { ...DEFAULT_TEMPURA_CONFIG };

  // Resolve project paths
  if (config.project) {
    config.project.rootDir = resolve(rootDir);
    if (config.project.sourceDir) {
      config.project.sourceDir = resolve(rootDir, config.project.sourceDir);
    }
  }

  // Resolve NestJS paths
  if (config.nest && config.nest.modulesDir) {
    config.nest.modulesDir = resolve(rootDir, config.nest.modulesDir);
  }

  // Resolve Tempura paths
  if (config.paths) {
    if (config.paths.tempuraDir) {
      config.paths.tempuraDir = resolve(rootDir, config.paths.tempuraDir);
    }
    if (config.paths.manifestFile) {
      config.paths.manifestFile = resolve(rootDir, config.paths.manifestFile);
    }
    if (config.paths.cacheDir) {
      config.paths.cacheDir = resolve(rootDir, config.paths.cacheDir);
    }
    if (config.paths.backupsDir) {
      config.paths.backupsDir = resolve(rootDir, config.paths.backupsDir);
    }
  }

  // Resolve template paths
  if (config.templates) {
    if (config.templates.builtinDir) {
      config.templates.builtinDir = resolve(rootDir, config.templates.builtinDir);
    }
    if (config.templates.userDir) {
      config.templates.userDir = resolve(rootDir, config.templates.userDir);
    }
  }

  return config;
}
