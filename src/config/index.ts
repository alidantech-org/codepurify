/**
 * Tempurify Configuration Module
 *
 * Central exports for all Tempurify configuration functionality.
 * This module provides types, validation, defaults, and loading utilities.
 */

// Type definitions
export type {
  TempurifyConfig,
  ResolvedTempurifyConfig,
  TempurifyProjectConfig,
  TempurifyNestConfig,
  TempurifyPathsConfig,
  TempurifyTemplateConfig,
  TempurifyImmutableConfig,
  TempurifyMutableConfig,
  TempurifyFormattingConfig,
  TempurifyGitConfig,
} from './config.types';

// Configuration helper
export { defineTempurifyConfig } from './define-config';

// Default configuration
export { DEFAULT_TEMPURA_CONFIG, createDefaultTempurifyConfig } from './config-defaults';

// Validation schemas
export {
  tempurifyConfigSchema,
  resolvedTempurifyConfigSchema,
  validateTempurifyConfig,
  validateResolvedTempurifyConfig,
} from './config-schema';

// Configuration loading
export { findTempurifyConfigFile, loadTempurifyConfig, ConfigError } from './config-loader';

// Configuration template generation
export * from './default-config-template';
export * from './config-template-generator';
