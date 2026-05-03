/**
 * Codepurify Templates Definition Helper
 *
 * Type-safe helper for defining template registry files.
 */

import type { CodepurifyTemplatesFile } from '../types/codepurify.templates.types';

/**
 * Define a Codepurify templates registry file.
 *
 * Example:
 * ```ts
 * export default defineCodepurifyTemplates({
 *   rootDir: './codepurify/templates',
 *   templates: [dtoCreateTemplate, dtoUpdateTemplate],
 * });
 * ```
 */
export function defineCodepurifyTemplates(config: CodepurifyTemplatesFile): CodepurifyTemplatesFile {
  return config;
}
