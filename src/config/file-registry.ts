/**
 * Tempurify File Registry
 *
 * Central registry for all file patterns and names used by Tempurify.
 * This ensures consistency across the codebase and makes it easy to
 * change file naming conventions.
 */

export const TEMPURIFY_FILE_REGISTRY = {
  input: {
    typesFile: '{entity}.types.ts',
    configFile: '{entity}.config.ts',
  },

  output: {
    contextFile: '{entity}.context.ts',
    barrelFile: 'index.ts',
  },

  generated: {
    entityFile: '{entity}.entity.ts',
    repositoryFile: '{entity}.repository.ts',
    serviceFile: '{entity}.service.ts',
    controllerFile: '{entity}.controller.ts',
    moduleFile: '{entity}.module.ts',
  },

  folders: {
    generated: '__generated__',
    custom: 'custom',
  },
} as const;

/**
 * File registry type exports
 */
export type FileRegistry = typeof TEMPURIFY_FILE_REGISTRY;
export type InputFiles = FileRegistry['input'];
export type OutputFiles = FileRegistry['output'];
export type GeneratedFiles = FileRegistry['generated'];
export type FolderNames = FileRegistry['folders'];
