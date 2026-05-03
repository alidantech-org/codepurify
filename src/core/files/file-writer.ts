import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { hashContent } from './file-hash';
import { relativeFromRoot, resolveInsideRoot } from './file-paths';
import type { CodepurifyFileBackups } from './file-backups';
import type { CodepurifyFileDb } from './file-db';
import type { CodepurifyFileReader } from './file-reader';
import type { WriteGeneratedFileInput, WriteGeneratedFileResult } from './file-types';

export class CodepurifyFileWriter {
  constructor(
    private readonly rootDir: string,
    private readonly db: CodepurifyFileDb,
    private readonly reader: CodepurifyFileReader,
    private readonly backups: CodepurifyFileBackups,
  ) {}

  async writeGenerated(input: WriteGeneratedFileInput): Promise<WriteGeneratedFileResult> {
    const absolutePath = resolveInsideRoot(this.rootDir, input.path);
    const relativePath = relativeFromRoot(this.rootDir, absolutePath);
    const hash = hashContent(input.content);
    const sizeBytes = Buffer.byteLength(input.content);

    const existing = await this.reader.read(relativePath, { hash: true });

    if (existing.exists && existing.hash === hash) {
      return {
        path: relativePath,
        absolutePath,
        hash,
        sizeBytes,
        action: 'unchanged',
      };
    }

    const backupSession = input.backupSession ?? (await this.backups.createSession(`write:${relativePath}`));

    const backupRecord = await this.backups.backupFile(backupSession, relativePath);

    await this.writeAtomically(absolutePath, input.content);

    const now = new Date().toISOString();

    await this.db.upsert({
      path: relativePath,
      absolutePath,
      kind: 'generated',
      source: input.source,
      template: input.template,
      hash,
      sizeBytes,
      createdAt: now,
      updatedAt: now,
      lastGeneratedAt: now,
      immutable: input.immutable ?? false,
      backup: backupRecord.backupPath
        ? {
            sessionId: backupSession.id,
            path: backupRecord.backupPath,
            createdAt: backupSession.createdAt,
          }
        : undefined,
      metadata: input.metadata,
    });

    return {
      path: relativePath,
      absolutePath,
      hash,
      sizeBytes,
      action: existing.exists ? 'updated' : 'created',
      backupPath: backupRecord.backupPath ?? undefined,
    };
  }

  async writeManyGenerated(inputs: WriteGeneratedFileInput[]): Promise<WriteGeneratedFileResult[]> {
    const session = await this.backups.createSession('generate');
    const results: WriteGeneratedFileResult[] = [];

    for (const input of inputs) {
      results.push(
        await this.writeGenerated({
          ...input,
          backupSession: input.backupSession ?? session,
        }),
      );
    }

    return results;
  }

  private async writeAtomically(path: string, content: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });

    const tempPath = `${path}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;

    await writeFile(tempPath, content, 'utf-8');
    await rename(tempPath, path);
  }
}
