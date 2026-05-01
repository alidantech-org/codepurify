/**
 * Tempura Configuration Types
 *
 * Defines the structure for Tempura's configuration system.
 * Supports project settings, NestJS paths, immutable/mutable rules,
 * formatting commands, git rules, and path management.
 */

/**
 * Project-level configuration
 */
export interface TempuraProjectConfig {
  /** Project name (optional) */
  name?: string;
  /** Root directory of the project */
  rootDir: string;
  /** Source directory containing source code */
  sourceDir: string;
}

/**
 * NestJS-specific configuration
 */
export interface TempuraNestConfig {
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
 * Path configuration for various Tempura resources
 */
export interface TempuraPathsConfig {
  /** Tempura working directory */
  tempuraDir: string;
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
export interface TempuraTemplateConfig {
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
export interface TempuraImmutableConfig {
  /** Whether immutable validation is enabled */
  enabled: boolean;
  /** Glob patterns for immutable files */
  include: string[];
}

/**
 * Mutable file configuration
 */
export interface TempuraMutableConfig {
  /** Glob patterns for mutable files */
  include: string[];
}

/**
 * Formatting configuration
 */
export interface TempuraFormattingConfig {
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
export interface TempuraGitConfig {
  /** Whether git integration is enabled */
  enabled: boolean;
  /** Required branch for generation operations */
  requiredBranch: string | null;
  /** Whether to prevent operations on dirty checkout */
  preventDirtyCheckout: boolean;
}

/**
 * Main Tempura configuration interface
 */
export interface TempuraConfig {
  /** Project configuration */
  project: Partial<TempuraProjectConfig>;
  /** NestJS configuration */
  nest: Partial<TempuraNestConfig>;
  /** Path configuration */
  paths?: Partial<TempuraPathsConfig>;
  /** Template configuration */
  templates?: Partial<TempuraTemplateConfig>;
  /** Immutable configuration */
  immutable?: Partial<TempuraImmutableConfig>;
  /** Mutable configuration */
  mutable?: Partial<TempuraMutableConfig>;
  /** Formatting configuration */
  formatting?: Partial<TempuraFormattingConfig>;
  /** Git configuration */
  git?: Partial<TempuraGitConfig>;
}

/**
 * Resolved Tempura configuration with all paths absolute
 */
export interface ResolvedTempuraConfig {
  /** Project configuration */
  project: TempuraProjectConfig;
  /** NestJS configuration */
  nest: TempuraNestConfig;
  /** Path configuration */
  paths: TempuraPathsConfig;
  /** Template configuration */
  templates: TempuraTemplateConfig;
  /** Immutable configuration */
  immutable: TempuraImmutableConfig;
  /** Mutable configuration */
  mutable: TempuraMutableConfig;
  /** Formatting configuration */
  formatting: TempuraFormattingConfig;
  /** Git configuration */
  git: TempuraGitConfig;
}
