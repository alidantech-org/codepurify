/**
 * Tempurify Config Definition Helper
 *
 * Provides the defineTempurifyConfig helper function for users to define
 * their Tempurify configuration with type safety and validation.
 */

import type { TempurifyConfig } from '../types/config.types';

/**
 * Helper function to define Tempurify configuration
 *
 * This function provides type safety and validation for user-defined
 * Tempurify configuration. It can be used in config files like:
 *
 * ```js
 * const { defineTempurifyConfig } = require("tempurify");
 *
 * module.exports = defineTempurifyConfig({
 *   project: {
 *     name: "my-app"
 *   }
 * });
 * ```
 *
 * @param config - User configuration object
 * @returns Validated configuration object
 */
export function defineTempurifyConfig(config: TempurifyConfig): TempurifyConfig {
  // Basic validation to ensure config is an object
  if (typeof config !== 'object' || config === null) {
    throw new Error('Tempurify config must be an object');
  }

  // Return the config as-is for now
  // Runtime validation will happen in config-loader.ts
  return config;
}
