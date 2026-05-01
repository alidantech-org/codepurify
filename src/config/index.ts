/**
 * Tempura Configuration Module
 * 
 * Central exports for all Tempura configuration functionality.
 * This module provides types, validation, defaults, and loading utilities.
 */

// Type definitions
export type {
  TempuraConfig,
  ResolvedTempuraConfig,
  TempuraProjectConfig,
  TempuraNestConfig,
  TempuraPathsConfig,
  TempuraTemplateConfig,
  TempuraImmutableConfig,
  TempuraMutableConfig,
  TempuraFormattingConfig,
  TempuraGitConfig,
} from './config.types';

// Configuration helper
export { defineTempuraConfig } from './define-config';

// Default configuration
export { DEFAULT_TEMPURA_CONFIG, createDefaultTempuraConfig } from './config-defaults';

// Validation schemas
export {
  tempuraConfigSchema,
  resolvedTempuraConfigSchema,
  validateTempuraConfig,
  validateResolvedTempuraConfig,
} from './config-schema';

// Configuration loading
export {
  findTempuraConfigFile,
  loadTempuraConfig,
  ConfigError,
} from './config-loader';
