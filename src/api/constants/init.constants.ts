/**
 * Init Action Constants
 *
 * Data-only constants for init action operations.
 */

export const INIT_FILES = {
  config: 'codepurify.config.ts',
  templates: 'codepurify.templates.ts',
  templatesDir: 'templates',
} as const;

export const INIT_EXAMPLE_TEMPLATE_FILES = ['entity.ts.hbs', 'dto.create.ts.hbs', 'dto.update.ts.hbs', 'service.ts.hbs'] as const;

export const INIT_TEMPLATE_NAMES = {
  config: 'init.config',
  templates: 'init.templates',
  unknown: 'init.unknown',
} as const;

export const INIT_LOG_MESSAGES = {
  starting: 'Initializing Codepurify project...',
  completed: 'Codepurify project initialized successfully.',
  dryRunCompleted: 'Codepurify init dry run completed.',
  backupCreated: (sessionId: string) => `Created init backup session: ${sessionId}`,
  skipped: (path: string) => `Skipped existing file: ${path}`,
  templateNotFound: (templatePath: string, candidates: string[]) =>
    `Failed to find init template "${templatePath}". Tried: ${candidates.join(', ')}`,
} as const;

export const INIT_ACTION = {
  name: 'init',
} as const;

export const INIT_MESSAGES = {
  projectAlreadyInitialized: 'Codepurify is already initialized. Re-initialize?',
  initializationCancelled: 'Initialization cancelled',
  initializingProject: 'Initializing Codepurify project...',
  projectInitialized: 'Codepurify initialized successfully!',
  configFile: 'Configuration file: codepurify.config.ts',
  workingDirectory: 'Working directory: .codepurify/',
  readyToGenerate: '✨ Ready to generate entities with: codepurify generate',
} as const;

export const TEMPLATE_SEARCH_PATHS = ['node_modules/@codepurify/templates', '.codepurify/templates', 'templates'] as const;
