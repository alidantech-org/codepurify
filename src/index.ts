/**
 * Tempurify
 *
 * Convention-locked NestJS backend generator.
 */

// Re-export configuration utilities
export { defineTempurifyConfig } from './config/define-config';

// Re-export types for convenience
export type { TempurifyConfig, ResolvedTempurifyConfig, TempurifyProjectConfig, TempurifyNestConfig } from './config/config.types';

// Re-export configuration loading utilities
export { loadTempurifyConfig, ConfigError } from './config/config-loader';
