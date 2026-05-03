/**
 * Init Action Constants
 *
 * Data-only constants for init action operations.
 */

export const INIT_OUTPUTS = {
  codeDir: 'code',
  gitignore: '.gitignore',
} as const;

export const INIT_GITIGNORE_ENTRIES = [
  '.codepurify/',
] as const;
