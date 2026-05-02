/**
 * Tempurify Configuration Types
 *
 * Defines the structure for Tempurify's configuration system.
 * Supports project settings, NestJS paths, immutable/mutable rules,
 * formatting commands, git rules, and path management.
 */

/**
 * Entity strategy type
 */
export type EntityStrategy = 'grouped' | 'flat';

/**
 * Tempurify project configuration
 */
export interface TempurifyProjectConfig {
  /** Root directory of the project (absolute path) */
  rootDir?: string;
  /** Source directory for generated NestJS code */
  sourceDir?: string;
  /** Types directory for user-owned entity contracts */
  typesDir?: string;
}

/**
 * Tempurify entity configuration
 */
export interface TempurifyEntityConfig {
  /** Entity discovery strategy */
  strategy?: EntityStrategy;
  /** Group pattern for grouped strategy */
  groupPattern?: string;
  /** Entity folder pattern */
  entityFolderPattern?: string;
}

/**
 * NestJS-specific configuration
 */
export interface TempurifyNestConfig {
  /** Directory containing NestJS modules */
  modulesDir: string;
  /** Pattern to find entity folders */
  entityFolderPattern: string;
  /** Pattern to find types files */
  typesFilePattern: string;
  /** Pattern to find config files */
  configFilePattern: string;
  /** Name of generated directory */
  generatedDirName: string;
  /** Name of custom directory */
  customDirName: string;
}

/**
 * Path configuration for various Tempurify resources
 */
export interface TempurifyPathsConfig {
  /** Tempurify working directory */
  tempurifyDir: string;
  /** Manifest file path */
  manifestFile: string;
  /** Cache directory path */
  cacheDir: string;
  /** Backups directory path */
  backupsDir: string;
}

/**
 * Template configuration
 */
export interface TempurifyTemplateConfig {
  /** Directory containing built-in templates */
  builtinDir: string;
  /** Directory containing user templates */
  userDir: string;
  /** Whether to allow user templates to override built-in ones */
  allowUserOverrides: boolean;
}

/**
 * Immutable file configuration
 */
export interface TempurifyImmutableConfig {
  /** Whether immutable validation is enabled */
  enabled: boolean;
  /** Glob patterns for immutable files */
  include: string[];
}

/**
 * Mutable file configuration
 */
export interface TempurifyMutableConfig {
  /** Glob patterns for mutable files */
  include: string[];
}

/**
 * Formatting configuration
 */
export interface TempurifyFormattingConfig {
  /** Whether to run prettier */
  prettier: boolean;
  /** Whether to run eslint */
  eslint: boolean;
  /** Whether to run TypeScript compiler */
  tsc: boolean;
}

/**
 * Git integration configuration
 */
export interface TempurifyGitConfig {
  /** Whether git integration is enabled */
  enabled: boolean;
  /** Required branch for generation operations */
  requiredBranch: string | null;
  /** Whether to prevent operations on dirty checkout */
  preventDirtyCheckout: boolean;
}

/**
 * Main Tempurify configuration interface
 */
export interface TempurifyConfig {
  /** Project configuration */
  project: Partial<TempurifyProjectConfig>;
  /** Entity configuration */
  entity?: Partial<TempurifyEntityConfig>;
  /** NestJS configuration */
  nest?: Partial<TempurifyNestConfig>;
  /** Path configuration */
  paths?: Partial<TempurifyPathsConfig>;
  /** Template configuration */
  templates?: Partial<TempurifyTemplateConfig>;
  /** Immutable configuration */
  immutable?: Partial<TempurifyImmutableConfig>;
  /** Mutable configuration */
  mutable?: Partial<TempurifyMutableConfig>;
  /** Formatting configuration */
  formatting?: Partial<TempurifyFormattingConfig>;
  /** Git configuration */
  git?: Partial<TempurifyGitConfig>;
}

/**
 * Resolved Tempurify configuration with all paths absolute
 */
export interface ResolvedTempurifyConfig {
  /** Project configuration */
  project: TempurifyProjectConfig;
  /** Entity configuration */
  entity: TempurifyEntityConfig;
  /** NestJS configuration */
  nest: TempurifyNestConfig;
  /** Path configuration */
  paths: TempurifyPathsConfig;
  /** Template configuration */
  templates: TempurifyTemplateConfig;
  /** Immutable configuration */
  immutable: TempurifyImmutableConfig;
  /** Mutable configuration */
  mutable: TempurifyMutableConfig;
  /** Formatting configuration */
  formatting: TempurifyFormattingConfig;
  /** Git configuration */
  git: TempurifyGitConfig;
}
