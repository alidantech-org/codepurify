/**
 * Tempura Configuration Validation Schemas
 *
 * Provides Zod schemas for runtime validation of Tempura configuration.
 * Ensures user configuration matches expected structure and types.
 */

import { z } from 'zod';
import type { TempuraConfig, ResolvedTempuraConfig } from './config.types';

/**
 * Schema for project configuration
 */
const projectConfigSchema = z.object({
  name: z.string().optional(),
  rootDir: z.string(),
  sourceDir: z.string(),
});

/**
 * Schema for NestJS configuration
 */
const nestConfigSchema = z.object({
  modulesDir: z.string(),
  entityFolderPattern: z.string(),
  typesFilePattern: z.string(),
  configFilePattern: z.string(),
  generatedDirName: z.string(),
  customDirName: z.string(),
});

/**
 * Schema for paths configuration
 */
const pathsConfigSchema = z.object({
  tempuraDir: z.string(),
  manifestFile: z.string(),
  cacheDir: z.string(),
  backupsDir: z.string(),
});

/**
 * Schema for template configuration
 */
const templateConfigSchema = z.object({
  builtinDir: z.string(),
  userDir: z.string(),
  allowUserOverrides: z.boolean(),
});

/**
 * Schema for immutable configuration
 */
const immutableConfigSchema = z.object({
  enabled: z.boolean(),
  include: z.array(z.string()),
});

/**
 * Schema for mutable configuration
 */
const mutableConfigSchema = z.object({
  include: z.array(z.string()),
});

/**
 * Schema for formatting configuration
 */
const formattingConfigSchema = z.object({
  prettier: z.boolean(),
  eslint: z.boolean(),
  tsc: z.boolean(),
});

/**
 * Schema for git configuration
 */
const gitConfigSchema = z.object({
  enabled: z.boolean(),
  requiredBranch: z.string().nullable(),
  preventDirtyCheckout: z.boolean(),
});

/**
 * Main Tempura configuration schema
 */
export const tempuraConfigSchema = z.object({
  project: projectConfigSchema.partial(),
  nest: nestConfigSchema.partial(),
  paths: pathsConfigSchema.optional(),
  templates: templateConfigSchema.optional(),
  immutable: immutableConfigSchema.optional(),
  mutable: mutableConfigSchema.optional(),
  formatting: formattingConfigSchema.optional(),
  git: gitConfigSchema.optional(),
}) satisfies z.ZodType<TempuraConfig>;

/**
 * Resolved Tempura configuration schema (all properties required)
 */
export const resolvedTempuraConfigSchema = z.object({
  project: projectConfigSchema,
  nest: nestConfigSchema,
  paths: pathsConfigSchema,
  templates: templateConfigSchema,
  immutable: immutableConfigSchema,
  mutable: mutableConfigSchema,
  formatting: formattingConfigSchema,
  git: gitConfigSchema,
}) satisfies z.ZodType<ResolvedTempuraConfig>;

/**
 * Validates a Tempura configuration object
 *
 * @param config - Configuration to validate
 * @returns Validated configuration
 * @throws ZodError if validation fails
 */
export function validateTempuraConfig(config: unknown): TempuraConfig {
  return tempuraConfigSchema.parse(config);
}

/**
 * Validates a resolved Tempura configuration object
 *
 * @param config - Resolved configuration to validate
 * @returns Validated resolved configuration
 * @throws ZodError if validation fails
 */
export function validateResolvedTempuraConfig(config: unknown): ResolvedTempuraConfig {
  return resolvedTempuraConfigSchema.parse(config);
}
