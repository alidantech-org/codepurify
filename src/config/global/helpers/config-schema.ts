/**
 * Codepurify Configuration Validation Schemas
 *
 * Provides Zod schemas for runtime validation of Codepurify configuration.
 * Ensures user configuration matches expected structure and types.
 */

import { z } from 'zod';
import type { CodepurifyConfig, ResolvedCodepurifyConfig } from '../types/config.types';

/**
 * Schema for entity strategy
 */
const entityStrategySchema = z.enum(['grouped', 'flat']);

/**
 * Schema for project configuration (user-facing, all optional)
 */
const projectConfigSchema = z.object({
  rootDir: z.string().optional(),
  sourceDir: z.string().optional(),
  typesDir: z.string().optional(),
});

/**
 * Schema for resolved project configuration (all required)
 */
const resolvedProjectConfigSchema = z.object({
  rootDir: z.string(),
  sourceDir: z.string(),
  typesDir: z.string(),
});

/**
 * Schema for entity configuration
 */
const entityConfigSchema = z.object({
  strategy: entityStrategySchema.optional(),
  groupPattern: z.string().optional(),
  entityFolderPattern: z.string().optional(),
});

/**
 * Schema for resolved entity configuration (all required)
 */
const resolvedEntityConfigSchema = z.object({
  strategy: entityStrategySchema,
  groupPattern: z.string(),
  entityFolderPattern: z.string(),
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
  codepurifyDir: z.string(),
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
 * Codepurify configuration schema (user-facing, all optional)
 */
export const codepurifyConfigSchema = z.object({
  project: projectConfigSchema.partial(),
  entity: entityConfigSchema.optional(),
  nest: nestConfigSchema.optional(),
  paths: pathsConfigSchema.optional(),
  templates: templateConfigSchema.optional(),
  immutable: immutableConfigSchema.optional(),
  mutable: mutableConfigSchema.optional(),
  formatting: formattingConfigSchema.optional(),
  git: gitConfigSchema.optional(),
}) satisfies z.ZodType<CodepurifyConfig>;

/**
 * Resolved Codepurify configuration schema (all properties required)
 */
export const resolvedCodepurifyConfigSchema = z.object({
  project: resolvedProjectConfigSchema,
  entity: resolvedEntityConfigSchema,
  nest: nestConfigSchema,
  paths: pathsConfigSchema,
  templates: templateConfigSchema,
  immutable: immutableConfigSchema,
  mutable: mutableConfigSchema,
  formatting: formattingConfigSchema,
  git: gitConfigSchema,
}) satisfies z.ZodType<ResolvedCodepurifyConfig>;

/**
 * Validates a Codepurify configuration object
 *
 * @param config - Configuration to validate
 * @returns Validated configuration
 * @throws ZodError if validation fails
 */
export function validateCodepurifyConfig(config: unknown): CodepurifyConfig {
  return codepurifyConfigSchema.parse(config);
}

/**
 * Validates a resolved Codepurify configuration object
 *
 * @param config - Resolved configuration to validate
 * @returns Validated resolved configuration
 * @throws ZodError if validation fails
 */
export function validateResolvedCodepurifyConfig(config: unknown): ResolvedCodepurifyConfig {
  return resolvedCodepurifyConfigSchema.parse(config);
}
