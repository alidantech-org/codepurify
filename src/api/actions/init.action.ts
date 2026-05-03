/**
 * Init Action
 *
 * Initializes Codepurify by copying package init assets into the project.
 */

import type { GeneratedFileResult, InitOptions, InitResult } from '@/api/types';

import type { CodepurifyAction, CodepurifyRuntime } from '@/api/runtime';

import { FileAction } from '@/api/types';

import {
  INIT_ACTION,
  INIT_GITIGNORE_ENTRIES,
  INIT_LOG_MESSAGES,
  INIT_OUTPUTS,
  INIT_TEMPLATE_NAMES,
  INIT_TEMPLATE_SYMBOLS,
} from '@/api/constants';

import { debug, info, success } from '@/core/logger';

async function ensureGitignoreEntries(runtime: CodepurifyRuntime): Promise<void> {
  const existing = await runtime.files.read(INIT_OUTPUTS.gitignore);

  const lines = new Set(
    (existing.exists ? existing.content : '')
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
    source: INIT_ACTION.source,
    template: INIT_TEMPLATE_NAMES.gitignore,
    immutable: false,
  });
}

function applyInitTemplateSymbols(content: string): string {
  // Replace the template root directory placeholder
  return content.replaceAll(INIT_TEMPLATE_SYMBOLS.templateRootDir, INIT_OUTPUTS.templatesRootDir);
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

    if (!options.dryRun) {
      await ensureGitignoreEntries(runtime);
    }

    const backupSession = options.dryRun ? undefined : await runtime.files.createBackupSession(INIT_ACTION.name);

    if (backupSession) {
      debug(INIT_LOG_MESSAGES.backupCreated(backupSession.id));
    }

    const assetFiles = await runtime.assets.listInitFiles();

    if (options.debug) {
      debug(
        INIT_LOG_MESSAGES.assetsFound(
          assetFiles.length,
          assetFiles.map((file) => file.path),
        ),
      );
    }

    // Copy all asset files with symbol patching for templates registry
    for (const asset of assetFiles) {
      const outputPath = `${INIT_OUTPUTS.codeDir}/${asset.path}`;
      const exists = await runtime.files.exists(outputPath);

      if (exists && !options.force) {
        skippedFiles.push(outputPath);
        debug(INIT_LOG_MESSAGES.skipped(outputPath));
        continue;
      }

      // Apply symbol patching for templates registry file
      const content = asset.path === 'codepurify.templates.ts' ? applyInitTemplateSymbols(asset.content) : asset.content;

      if (!options.dryRun) {
        await runtime.files.writeGenerated({
          path: outputPath,
          content,
          source: INIT_ACTION.source,
          template: INIT_TEMPLATE_NAMES.asset,
          immutable: false,
          backupSession,
        });
      }

      createdFiles.push({
        path: outputPath,
        action: FileAction.CREATED,
        templateName: INIT_TEMPLATE_NAMES.asset,
        size: content.length,
        changed: true,
      });
    }

    success(options.dryRun ? INIT_LOG_MESSAGES.dryRunCompleted : INIT_LOG_MESSAGES.completed);

    return {
      createdFiles,
      skippedFiles,
    };
  },
};
