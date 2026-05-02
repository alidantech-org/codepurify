/**
 * Codepurify Default Configuration
 *
 * Provides default values for all Codepurify configuration options.
 * These defaults are merged with user configuration.
 */

import { DEFAULT_TEMPURA_CONFIG } from '../defaults/config';
import type { CodepurifyConfig } from '../types/config.types';
import { resolve } from 'node:path';

/**
 * Creates a default Codepurify configuration with resolved paths
 *
 * @param rootDir - Root directory to resolve paths from (defaults to process.cwd())
 * @returns Default configuration with absolute paths
 */
export function createDefaultCodepurifyConfig(rootDir: string = process.cwd()): CodepurifyConfig {
  const config = { ...DEFAULT_TEMPURA_CONFIG };

  // Add rootDir to project config (internal only, not in user config)
  if (config.project) {
    (config.project as any).rootDir = resolve(rootDir);
  }

  return config;
}
