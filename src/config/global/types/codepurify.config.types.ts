/**
 * Codepurify Config Types
 *
 * Types for global configuration and resolved configurations.
 */

/**
 * Global Codepurify config.
 *
 * Keep this separate from templates so templates can be imported directly
 * into entity configs for traceability.
 */
export interface CodepurifyConfig {
  /**
   * Optional project root.
   */
  rootDir?: string;

  /**
   * Optional manifest output path.
   */
  manifestPath?: string;

  /**
   * Optional generated output root.
   */
  outputDir?: string;
}

/**
 * Resolved global config.
 */
export interface ResolvedCodepurifyConfig {
  rootDir: string;
  manifestPath: string;
  outputDir: string;
}
