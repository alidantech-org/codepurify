/**
 * Tempurify
 *
 * Convention-locked NestJS backend generator.
 */

// Re-export configuration utilities
export { defineTempurifyConfig } from './config/define-config';
export * from './config';

// Re-export types for convenience
export * from './types';

// Re-export configuration loading utilities
export { loadTempurifyConfig, ConfigError } from './config/config-loader';
