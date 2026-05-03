/**
 * Init Action
 *
 * Initializes Codepurify by copying template files from the init directory.
 * Creates the basic project structure needed for Codepurify operations.
 *
 * Pipeline:
 *
 * backup session creation
 *   ↓
 * ensure gitignore entries
 *   ↓
 * copy template directory
 *   ↓
 * result mapping
 */

import type { GeneratedFileResult, InitOptions, InitResult } from '@/api/types';
import type { CodepurifyAction, CodepurifyRuntime } from '@/api/runtime';
import { FileAction } from '@/api/types';
import { INIT_OUTPUTS, INIT_GITIGNORE_ENTRIES } from '@/api/constants';
import { debug, info, success } from '@/core/logger';

/**
 * Ensure gitignore entries are present.
 *
 * Expected:
 * - read existing .gitignore if it exists
 * - add .codepurify/ entry if not present
 * - write updated .gitignore
 */
async function ensureGitignoreEntries(runtime: CodepurifyRuntime): Promise<void> {
  const existing = await runtime.files.read(INIT_OUTPUTS.gitignore);

  const current = existing.exists ? existing.content : '';
  const lines = new Set(
    current
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  );

  for (const entry of INIT_GITIGNORE_ENTRIES) {
    lines.add(entry);
  }

  await runtime.files.writeGenerated({
    path: INIT_OUTPUTS.gitignore,
    content: `${Array.from(lines).join('\n')}\n`,
    source: 'init',
    template: 'init.gitignore',
    immutable: false,
  });
}

export const initAction: CodepurifyAction<InitOptions, InitResult> = {
  name: 'init',

  defaults: () => ({
    createdFiles: [],
    skippedFiles: [],
  }),

  async run(runtime, options) {
    info('Initializing Codepurify project...');

    const createdFiles: GeneratedFileResult[] = [];
    const skippedFiles: string[] = [];

    /**
     * STEP 1
     * -----------------------------------------
     * Ensure gitignore entries are present.
     *
     * This adds .codepurify/ to .gitignore to prevent committing
     * internal runtime state.
     */
    if (!options.dryRun) {
      await ensureGitignoreEntries(runtime);
    }

    /**
     * STEP 2
     * -----------------------------------------
     * Create backup session for init operations.
     *
     * This session will track all file changes made during initialization
     * so they can be rolled back if needed.
     */
    const backupSession = options.dryRun ? undefined : await runtime.files.createBackupSession('init');

    if (backupSession) {
      debug(`Created init backup session: ${backupSession.id}`);
    }

    /**
     * STEP 3
     * -----------------------------------------
     * Copy template directory from init templates.
     *
     * This copies the entire code/ directory from the init templates
     * to the project root, maintaining the directory structure.
     */
    if (options.debug) {
      debug('Copying init template directory...');
    }

    const copyResult = await runtime.assets.copyDirectory({
      from: 'code',
      to: 'code',
      runtime,
      overwrite: options.force,
      backupSession,
    });

    /**
     * STEP 4
     * -----------------------------------------
     * Map copy results to API results.
     *
     * Expected:
     * - action mapping (created/skipped)
     * - template name resolution
     * - size extraction
     */
    createdFiles.push(
      ...copyResult.created.map((file) => ({
        path: file.path,
        action: FileAction.CREATED,
        templateName: 'init.template',
        size: file.size,
        changed: true,
      })),
    );

    skippedFiles.push(...copyResult.skipped);

    /**
     * STEP 5
     * -----------------------------------------
     * Finalize initialization.
     *
     * Return structured result with initialization details.
     */
    success('Codepurify project initialized successfully.');

    return {
      createdFiles,
      skippedFiles,
    };
  },
};
