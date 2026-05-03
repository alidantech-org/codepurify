/**
 * Init Action Constants
 *
 * Data-only constants for init action operations.
 */

export const INIT_ACTION = {
  name: 'init',
  source: 'init',
} as const;

export const INIT_ASSET_PATHS = {
  rootDir: 'code',
  templatesDir: 'templates',
  templatesRegistryFile: 'codepurify.templates.ts',
} as const;

export const INIT_TEMPLATE_SYMBOLS = {
  templateRootDir: '__CODEPURIFY_TEMPLATE_ROOT_DIR__',
} as const;

export const INIT_OUTPUTS = {
  codeDir: 'code',
  templatesRootDir: './code/templates',
  gitignore: '.gitignore',
} as const;

export const INIT_GITIGNORE_ENTRIES = ['.codepurify/'] as const;

export const INIT_FILE_EXTENSIONS = {
  handlebars: '.hbs',
  typescript: '.ts',
} as const;

export const INIT_TEMPLATE_IMPORTS = {
  packageName: 'codepurify',
  paths: 'paths',
  file: 'file',
  defineTemplates: 'defineCodepurifyTemplates',
} as const;

export const INIT_TEMPLATE_NAMES = {
  asset: 'init.asset',
  gitignore: 'init.gitignore',
  templatesConfig: 'init.templates.config',
} as const;

export const ASSET_PATHS = {
  distRoot: '../../code',
  initRoot: '',
} as const;

export const INIT_LOG_MESSAGES = {
  starting: 'Initializing Codepurify project...',
  completed: 'Codepurify project initialized successfully.',
  dryRunCompleted: 'Codepurify init dry run completed.',
  backupCreated: (sessionId: string) => `Created init backup session: ${sessionId}`,
  assetsFound: (count: number, paths: string[]) => `Found ${count} init asset file(s): ${paths.join(', ')}`,
  templatesFound: (count: number, paths: string[]) => `Found ${count} template file(s): ${paths.join(', ')}`,
  skipped: (path: string) => `Skipped existing file: ${path}`,
} as const;
