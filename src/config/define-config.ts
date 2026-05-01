/**
 * Tempura Config Definition Helper
 *
 * Provides the defineTempuraConfig helper function for users to define
 * their Tempura configuration with type safety and validation.
 */

import type { TempuraConfig } from './config.types';

/**
 * Helper function to define Tempura configuration
 *
 * This function provides type safety and validation for user-defined
 * Tempura configuration. It can be used in config files like:
 *
 * ```js
 * const { defineTempuraConfig } = require("tempura");
 *
 * module.exports = defineTempuraConfig({
 *   project: {
 *     name: "my-app"
 *   }
 * });
 * ```
 *
 * @param config - User configuration object
 * @returns Validated configuration object
 */
export function defineTempuraConfig(config: TempuraConfig): TempuraConfig {
  // Basic validation to ensure config is an object
  if (typeof config !== 'object' || config === null) {
    throw new Error('Tempura config must be an object');
  }

  // Return the config as-is for now
  // Runtime validation will happen in config-loader.ts
  return config;
}
