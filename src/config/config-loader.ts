/**
 * Tempurify Configuration Loader
 *
 * Handles loading, validating, and merging Tempurify configuration files.
 * Supports multiple config file formats and resolves paths to absolute paths.
 */

import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createJiti } from 'jiti';

import type { TempurifyConfig, ResolvedTempurifyConfig } from './config.types';
import { DEFAULT_TEMPURA_CONFIG, createDefaultTempurifyConfig } from './config-defaults';
import { validateTempurifyConfig, validateResolvedTempurifyConfig } from './config-schema';

/**
 * Supported configuration file names in order of preference
 */
const CONFIG_FILE_NAMES = ['tempurify.config.ts', 'tempurify.config.js', 'tempurify.config.mjs', 'tempurify.config.cjs'] as const;

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
 * Finds a Tempurify configuration file in the given directory
 *
 * @param rootDir - Directory to search in (defaults to process.cwd())
 * @returns Path to config file or null if not found
 */
export async function findTempurifyConfigFile(rootDir: string = process.cwd()): Promise<string | null> {
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
 * Loads a configuration file dynamically using jiti
 *
 * @param configPath - Path to the configuration file
 * @returns Loaded configuration object
 */
async function loadConfigFile(configPath: string): Promise<TempurifyConfig> {
  try {
    // Create jiti instance for dynamic loading
    const jiti = createJiti(import.meta.url);

    // Load the config file dynamically
    const imported = await jiti.import(configPath);

    // Handle both default export and module.exports
    const config = (imported as any)?.default ?? imported;

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
function mergeConfig(defaults: TempurifyConfig, userConfig: TempurifyConfig): TempurifyConfig {
  const merged: TempurifyConfig = { ...defaults };

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
function resolvePaths(config: TempurifyConfig, rootDir: string): ResolvedTempurifyConfig {
  const resolved = config as any;

  // Set rootDir from process.cwd() (internal only, never from user config)
  if (resolved.project) {
    resolved.project.rootDir = resolve(rootDir);
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

  // Resolve Tempurify paths
  if (resolved.paths) {
    if (resolved.paths.tempurifyDir) {
      resolved.paths.tempurifyDir = resolve(rootDir, resolved.paths.tempurifyDir);
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
 * Loads and validates Tempurify configuration
 *
 * @param rootDir - Root directory to search for config (defaults to process.cwd())
 * @returns Resolved and validated configuration
 * @throws ConfigError if configuration is invalid or missing
 */
export async function loadTempurifyConfig(rootDir: string = process.cwd()): Promise<ResolvedTempurifyConfig> {
  try {
    // Find configuration file
    const configPath = await findTempurifyConfigFile(rootDir);

    if (!configPath) {
      throw new ConfigError(`No Tempurify configuration file found in: ${rootDir}\n` + `Supported files: ${CONFIG_FILE_NAMES.join(', ')}`);
    }

    // Load user configuration
    const userConfig = await loadConfigFile(configPath);

    // Validate user configuration
    const validatedUserConfig = validateTempurifyConfig(userConfig);

    // Create default configuration
    const defaultConfig = createDefaultTempurifyConfig(rootDir);

    // Merge configurations
    const mergedConfig = mergeConfig(defaultConfig, validatedUserConfig);

    // Resolve paths to absolute paths
    const resolvedConfig = resolvePaths(mergedConfig, rootDir);

    // Validate final resolved configuration
    return validateResolvedTempurifyConfig(resolvedConfig);
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    throw new ConfigError('Failed to load Tempurify configuration', error as Error);
  }
}
