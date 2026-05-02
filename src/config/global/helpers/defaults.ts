/**
 * Tempurify Default Configuration
 *
 * Provides default values for all Tempurify configuration options.
 * These defaults are merged with user configuration.
 */

import { DEFAULT_TEMPURA_CONFIG } from '../defaults/config';
import type { TempurifyConfig } from '../types/config.types';
import { resolve } from 'node:path';

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
