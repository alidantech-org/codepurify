/**
 * Init Action
 *
 * Initializes Codepurify configuration and template registry files.
 * Creates the basic project structure needed for Codepurify operations.
 *
 * Pipeline:
 *
 * backup session creation
 *   ↓
 * template discovery
 *   ↓
 * file queuing
 *   ↓
 * file writing
 *   ↓
 * result mapping
 */

import { resolve } from 'node:path';

import type { GeneratedFileResult, InitOptions, InitResult } from '@/api/types';

import type { CodepurifyAction, CodepurifyRuntime } from '@/api/runtime';

import type { WriteGeneratedFileInput } from '@/core/files';

import {
  INIT_ACTION,
  INIT_EXAMPLE_TEMPLATE_FILES,
  INIT_FILES,
  INIT_LOG_MESSAGES,
  INIT_TEMPLATE_NAMES,
  TEMPLATE_SEARCH_PATHS,
} from '@/api/constants';

import { debug, info, success } from '@/core/logger';

/**
 * Read an init template file from multiple possible locations.
 *
 * Expected:
 * - template discovery from multiple search paths
 * - file reading using files module
 * - error handling for missing templates
 */
async function readInitTemplate(runtime: CodepurifyRuntime, templatePath: string): Promise<string> {
  const candidates = TEMPLATE_SEARCH_PATHS.map((basePath) => resolve(runtime.cwd, basePath, templatePath));

  for (const candidate of candidates) {
    const relativePath = candidate.replace(runtime.cwd, '').replace(/^[\\/]/, '');

    const result = await runtime.files.read(relativePath);

    if (result.exists) {
      return result.content;
    }
  }

  throw new Error(INIT_LOG_MESSAGES.templateNotFound(templatePath, candidates));
}

/**
 * Queue a file for writing during initialization.
 *
 * Expected:
 * - file existence checking
 * - force mode handling
 * - backup session tracking
 * - immutable file marking
 */
async function queueFile(input: {
  runtime: CodepurifyRuntime;
  options: InitOptions;
  path: string;
  content: string;
  template: string;
  immutable: boolean;
  backupSession?: WriteGeneratedFileInput['backupSession'];
  fileInputs: WriteGeneratedFileInput[];
  skippedFiles: string[];
}): Promise<void> {
  const exists = await input.runtime.files.exists(input.path);

  if (exists && !input.options.force) {
    input.skippedFiles.push(input.path);
    debug(INIT_LOG_MESSAGES.skipped(input.path));
    return;
  }

  input.fileInputs.push({
    path: input.path,
    content: input.content,
    source: INIT_ACTION.name,
    template: input.template,
    immutable: input.immutable,
    backupSession: input.backupSession,
  });
}

export const initAction: CodepurifyAction<InitOptions, InitResult> = {
  name: INIT_ACTION.name,

  defaults: () => ({
    createdFiles: [],
    skippedFiles: [],
  }),

  async run(runtime, options) {
    info(INIT_LOG_MESSAGES.starting);

    const createdFiles: GeneratedFileResult[] = [];
    const skippedFiles: string[] = [];
    const fileInputs: WriteGeneratedFileInput[] = [];

    /**
     * STEP 1
     * -----------------------------------------
     * Create backup session for init operations.
     *
     * This session will track all file changes made during initialization
     * so they can be rolled back if needed.
     *
     * Expected:
     * - backup session creation
     * - session ID generation
     * - dry-run mode support
     */

    const backupSession = options.dryRun ? undefined : await runtime.files.createBackupSession(INIT_ACTION.name);

    if (backupSession) {
      debug(INIT_LOG_MESSAGES.backupCreated(backupSession.id));
    }

    /**
     * STEP 2
     * -----------------------------------------
     * Queue configuration files for creation.
     *
     * These are the core configuration files needed for Codepurify:
     * - codepurify.config.ts: main configuration
     * - codepurify.templates.ts: template registry
     *
     * Expected:
     * - template discovery and reading
     * - file existence checking
     * - force mode handling
     * - immutable file marking
     */

    await queueFile({
      runtime,
      options,
      path: INIT_FILES.config,
      content: await readInitTemplate(runtime, INIT_FILES.config),
      template: INIT_TEMPLATE_NAMES.config,
      immutable: true,
      backupSession,
      fileInputs,
      skippedFiles,
    });

    await queueFile({
      runtime,
      options,
      path: INIT_FILES.templates,
      content: await readInitTemplate(runtime, INIT_FILES.templates),
      template: INIT_TEMPLATE_NAMES.templates,
      immutable: true,
      backupSession,
      fileInputs,
      skippedFiles,
    });

    /**
     * STEP 3
     * -----------------------------------------
     * Queue example template files for creation.
     *
     * These are example templates that users can reference:
     * - entity.ts.hbs: entity template
     * - dto.create.ts.hbs: create DTO template
     * - dto.update.ts.hbs: update DTO template
     * - service.ts.hbs: service template
     *
     * Expected:
     * - template discovery and reading
     * - file existence checking
     * - path resolution
     * - template name mapping
     */

    for (const fileName of INIT_EXAMPLE_TEMPLATE_FILES) {
      const outputPath = `${INIT_FILES.templatesDir}/example/${fileName}`;

      await queueFile({
        runtime,
        options,
        path: outputPath,
        content: await readInitTemplate(runtime, `templates/${fileName}`),
        template: `init.${fileName.replace('.hbs', '')}`,
        immutable: false,
        backupSession,
        fileInputs,
        skippedFiles,
      });
    }

    /**
     * STEP 4
     * -----------------------------------------
     * Handle dry-run mode.
     *
     * In dry-run mode, files are not actually written.
     * Instead, we return what would be created.
     *
     * Expected:
     * - file input mapping to results
     * - size calculation
     * - action marking
     */

    if (options.dryRun) {
      createdFiles.push(
        ...fileInputs.map((input) => ({
          path: input.path,
          action: 'created' as const,
          templateName: input.template,
          size: input.content.length,
          changed: true,
        })),
      );

      success(INIT_LOG_MESSAGES.dryRunCompleted);
      return { createdFiles, skippedFiles };
    }

    /**
     * STEP 5
     * -----------------------------------------
     * Write queued files to disk.
     *
     * Expected:
     * - atomic file writes
     * - backup tracking
     * - hash comparison
     * - file DB updates
     */

    const writeResults = await runtime.files.writeManyGenerated(fileInputs);

    /**
     * STEP 6
     * -----------------------------------------
     * Map write results to API results.
     *
     * Expected:
     * - action mapping (created/updated/unchanged)
     * - template name resolution
     * - size extraction
     * - change detection
     */

    createdFiles.push(
      ...writeResults.map((result) => {
        const input = fileInputs.find((item) => item.path === result.path);

        return {
          path: result.path,
          action: result.action === 'unchanged' ? 'unchanged' : 'created',
          templateName: input?.template ?? INIT_TEMPLATE_NAMES.unknown,
          size: result.sizeBytes,
          changed: result.action !== 'unchanged',
        } satisfies GeneratedFileResult;
      }),
    );

    /**
     * STEP 7
     * -----------------------------------------
     * Finalize initialization.
     *
     * Return structured result with initialization details.
     */

    success(INIT_LOG_MESSAGES.completed);

    return {
      createdFiles,
      skippedFiles,
    };
  },
};
