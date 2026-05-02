/**
 * Codepurify Configuration Types
 *
 * Defines the structure for Codepurify's configuration system.
 * Supports project settings, NestJS paths, immutable/mutable rules,
 * formatting commands, git rules, and path management.
 */

/**
 * Entity strategy type
 */
export type EntityStrategy = 'grouped' | 'flat';

/**
 * Codepurify project configuration
 */
export interface CodepurifyProjectConfig {
  /** Root directory of the project (absolute path) */
  rootDir?: string;
  /** Source directory for generated NestJS code */
  sourceDir?: string;
  /** Types directory for user-owned entity contracts */
  typesDir?: string;
}

/**
 * Codepurify entity configuration
 */
export interface CodepurifyEntityConfig {
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
export interface CodepurifyNestConfig {
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
 * Path configuration for various Codepurify resources
 */
export interface CodepurifyPathsConfig {
  /** Codepurify working directory */
  codepurifyDir: string;
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
export interface CodepurifyTemplateConfig {
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
export interface CodepurifyImmutableConfig {
  /** Whether immutable validation is enabled */
  enabled: boolean;
  /** Glob patterns for immutable files */
  include: string[];
}

/**
 * Mutable file configuration
 */
export interface CodepurifyMutableConfig {
  /** Glob patterns for mutable files */
  include: string[];
}

/**
 * Formatting configuration
 */
export interface CodepurifyFormattingConfig {
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
export interface CodepurifyGitConfig {
  /** Whether git integration is enabled */
  enabled: boolean;
  /** Required branch for generation operations */
  requiredBranch: string | null;
  /** Whether to prevent operations on dirty checkout */
  preventDirtyCheckout: boolean;
}

/**
 * Main Codepurify configuration interface
 */
export interface CodepurifyConfig {
  /** Project configuration */
  project: Partial<CodepurifyProjectConfig>;
  /** Entity configuration */
  entity?: Partial<CodepurifyEntityConfig>;
  /** NestJS configuration */
  nest?: Partial<CodepurifyNestConfig>;
  /** Path configuration */
  paths?: Partial<CodepurifyPathsConfig>;
  /** Template configuration */
  templates?: Partial<CodepurifyTemplateConfig>;
  /** Immutable configuration */
  immutable?: Partial<CodepurifyImmutableConfig>;
  /** Mutable configuration */
  mutable?: Partial<CodepurifyMutableConfig>;
  /** Formatting configuration */
  formatting?: Partial<CodepurifyFormattingConfig>;
  /** Git configuration */
  git?: Partial<CodepurifyGitConfig>;
}

/**
 * Resolved Codepurify configuration with all paths absolute
 */
export interface ResolvedCodepurifyConfig {
  /** Project configuration */
  project: CodepurifyProjectConfig;
  /** Entity configuration */
  entity: CodepurifyEntityConfig;
  /** NestJS configuration */
  nest: CodepurifyNestConfig;
  /** Path configuration */
  paths: CodepurifyPathsConfig;
  /** Template configuration */
  templates: CodepurifyTemplateConfig;
  /** Immutable configuration */
  immutable: CodepurifyImmutableConfig;
  /** Mutable configuration */
  mutable: CodepurifyMutableConfig;
  /** Formatting configuration */
  formatting: CodepurifyFormattingConfig;
  /** Git configuration */
  git: CodepurifyGitConfig;
}
