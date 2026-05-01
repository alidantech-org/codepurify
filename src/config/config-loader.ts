/**
 * Tempura Configuration Loader
 *
 * Handles loading, validating, and merging Tempura configuration files.
 * Supports multiple config file formats and resolves paths to absolute paths.
 */

import { readFile, access, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import type { TempuraConfig, ResolvedTempuraConfig } from './config.types';
import { DEFAULT_TEMPURA_CONFIG, createDefaultTempuraConfig } from './config-defaults';
import { validateTempuraConfig, validateResolvedTempuraConfig } from './config-schema';

/**
 * Supported configuration file names in order of preference
 */
const CONFIG_FILE_NAMES = ['tempura.config.js', 'tempura.config.mjs', 'tempura.config.cjs', 'tempura.config.ts'] as const;

/**
 * Error thrown when configuration is invalid or missing
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Finds a Tempura configuration file in the given directory
 *
 * @param rootDir - Directory to search in (defaults to process.cwd())
 * @returns Path to config file or null if not found
 */
export async function findTempuraConfigFile(rootDir: string = process.cwd()): Promise<string | null> {
  try {
    // Check if directory exists
    await access(rootDir);
    const dirStat = await stat(rootDir);
    if (!dirStat.isDirectory()) {
      throw new ConfigError(`Root directory is not a directory: ${rootDir}`);
    }
  } catch (error) {
    throw new ConfigError(`Cannot access root directory: ${rootDir}`, error as Error);
  }

  // Search for config files in order of preference
  for (const filename of CONFIG_FILE_NAMES) {
    const configPath = resolve(rootDir, filename);
    try {
      await access(configPath);
      const configStat = await stat(configPath);
      if (configStat.isFile()) {
        return configPath;
      }
    } catch {
      // File doesn't exist or isn't accessible, continue searching
      continue;
    }
  }

  return null;
}

/**
 * Loads a configuration file dynamically
 *
 * @param configPath - Path to the configuration file
 * @returns Loaded configuration object
 */
async function loadConfigFile(configPath: string): Promise<TempuraConfig> {
  try {
    // Determine file extension and loading strategy
    const ext = configPath.split('.').pop();

    if (ext === 'ts') {
      // For TypeScript files, we need to use a different approach
      // For now, we'll throw an error as TypeScript config loading requires additional setup
      throw new ConfigError('TypeScript config files are not yet supported. Use .js, .mjs, or .cjs files.');
    }

    // Create a require function that can handle ES modules
    const require = createRequire(import.meta.url);

    // Clear require cache to ensure fresh loading
    delete require.cache[require.resolve(configPath)];

    // Load the config file
    const configModule = require(configPath);

    // Handle both default export and module.exports
    const config = configModule.default || configModule;

    if (typeof config !== 'object' || config === null) {
      throw new ConfigError('Configuration must export an object');
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    throw new ConfigError(`Failed to load config file: ${configPath}`, error as Error);
  }
}

/**
 * Deep merges user configuration with defaults
 *
 * @param defaults - Default configuration
 * @param userConfig - User configuration
 * @returns Merged configuration
 */
function mergeConfig(defaults: TempuraConfig, userConfig: TempuraConfig): TempuraConfig {
  const merged: TempuraConfig = { ...defaults };

  // Helper function to merge objects recursively
  function merge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = merge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  // Merge each configuration section
  if (userConfig.project) {
    merged.project = merge(merged.project || {}, userConfig.project);
  }

  if (userConfig.nest) {
    merged.nest = merge(merged.nest || {}, userConfig.nest);
  }

  if (userConfig.paths) {
    merged.paths = merge(merged.paths || {}, userConfig.paths);
  }

  if (userConfig.templates) {
    merged.templates = merge(merged.templates || {}, userConfig.templates);
  }

  if (userConfig.immutable) {
    merged.immutable = merge(merged.immutable || {}, userConfig.immutable);
  }

  if (userConfig.mutable) {
    merged.mutable = merge(merged.mutable || {}, userConfig.mutable);
  }

  if (userConfig.formatting) {
    merged.formatting = merge(merged.formatting || {}, userConfig.formatting);
  }

  if (userConfig.git) {
    merged.git = merge(merged.git || {}, userConfig.git);
  }

  return merged;
}

/**
 * Resolves all relative paths in configuration to absolute paths
 *
 * @param config - Configuration with potentially relative paths
 * @param rootDir - Root directory to resolve paths from
 * @returns Configuration with absolute paths
 */
function resolvePaths(config: TempuraConfig, rootDir: string): ResolvedTempuraConfig {
  const resolved = config as any;

  // Resolve project paths
  if (resolved.project) {
    resolved.project.rootDir = resolve(rootDir, resolved.project.rootDir);
    if (resolved.project.sourceDir) {
      resolved.project.sourceDir = resolve(rootDir, resolved.project.sourceDir);
    }
  }

  // Resolve NestJS paths
  if (resolved.nest) {
    if (resolved.nest.modulesDir) {
      resolved.nest.modulesDir = resolve(rootDir, resolved.nest.modulesDir);
    }
  }

  // Resolve Tempura paths
  if (resolved.paths) {
    if (resolved.paths.tempuraDir) {
      resolved.paths.tempuraDir = resolve(rootDir, resolved.paths.tempuraDir);
    }
    if (resolved.paths.manifestFile) {
      resolved.paths.manifestFile = resolve(rootDir, resolved.paths.manifestFile);
    }
    if (resolved.paths.cacheDir) {
      resolved.paths.cacheDir = resolve(rootDir, resolved.paths.cacheDir);
    }
    if (resolved.paths.backupsDir) {
      resolved.paths.backupsDir = resolve(rootDir, resolved.paths.backupsDir);
    }
  }

  // Resolve template paths
  if (resolved.templates) {
    if (resolved.templates.builtinDir) {
      resolved.templates.builtinDir = resolve(rootDir, resolved.templates.builtinDir);
    }
    if (resolved.templates.userDir) {
      resolved.templates.userDir = resolve(rootDir, resolved.templates.userDir);
    }
  }

  return resolved;
}

/**
 * Loads and validates Tempura configuration
 *
 * @param rootDir - Root directory to search for config (defaults to process.cwd())
 * @returns Resolved and validated configuration
 * @throws ConfigError if configuration is invalid or missing
 */
export async function loadTempuraConfig(rootDir: string = process.cwd()): Promise<ResolvedTempuraConfig> {
  try {
    // Find configuration file
    const configPath = await findTempuraConfigFile(rootDir);

    if (!configPath) {
      throw new ConfigError(`No Tempura configuration file found in: ${rootDir}\n` + `Supported files: ${CONFIG_FILE_NAMES.join(', ')}`);
    }

    // Load user configuration
    const userConfig = await loadConfigFile(configPath);

    // Validate user configuration
    const validatedUserConfig = validateTempuraConfig(userConfig);

    // Create default configuration
    const defaultConfig = createDefaultTempuraConfig(rootDir);

    // Merge configurations
    const mergedConfig = mergeConfig(defaultConfig, validatedUserConfig);

    // Resolve paths to absolute paths
    const resolvedConfig = resolvePaths(mergedConfig, rootDir);

    // Validate final resolved configuration
    return validateResolvedTempuraConfig(resolvedConfig);
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    throw new ConfigError('Failed to load Tempura configuration', error as Error);
  }
}
