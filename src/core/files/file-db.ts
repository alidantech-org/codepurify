import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import type { CodepurifyFileRecord, CodepurifyFilesDb } from './file-types';

export class CodepurifyFileDb {
  readonly dbPath: string;

  constructor(rootDir: string, dbPath = '.codepurify/files.json') {
    this.dbPath = resolve(rootDir, dbPath);
  }

  createEmpty(): CodepurifyFilesDb {
    return {
      version: 1,
      generator: 'codepurify',
      updatedAt: null,
      records: [],
    };
  }

  async load(): Promise<CodepurifyFilesDb> {
    try {
      const content = await readFile(this.dbPath, 'utf-8');
      const parsed = JSON.parse(content) as CodepurifyFilesDb;

      if (parsed.version !== 1 || parsed.generator !== 'codepurify' || !Array.isArray(parsed.records)) {
        throw new Error('Invalid Codepurify file DB structure.');
      }

      return parsed;
    } catch (error) {
      const fsError = error as NodeJS.ErrnoException;

      if (fsError.code === 'ENOENT') {
        return this.createEmpty();
      }

      throw error;
    }
  }

  async save(db: CodepurifyFilesDb): Promise<void> {
    const nextDb: CodepurifyFilesDb = {
      ...db,
      updatedAt: new Date().toISOString(),
    };

    await mkdir(dirname(this.dbPath), { recursive: true });

    const tempPath = `${this.dbPath}.tmp.${Date.now()}`;
    await writeFile(tempPath, JSON.stringify(nextDb, null, 2) + '\n', 'utf-8');
    await rename(tempPath, this.dbPath);
  }

  async get(path: string): Promise<CodepurifyFileRecord | null> {
    const db = await this.load();
    return db.records.find((record) => record.path === path) ?? null;
  }

  async list(): Promise<CodepurifyFileRecord[]> {
    const db = await this.load();
    return db.records;
  }

  async upsert(record: CodepurifyFileRecord): Promise<void> {
    const db = await this.load();

    const existing = db.records.find((item) => item.path === record.path);
    const createdAt = existing?.createdAt ?? record.createdAt;

    db.records = db.records.filter((item) => item.path !== record.path);
    db.records.push({
      ...record,
      createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.save(db);
  }

  async remove(path: string): Promise<void> {
    const db = await this.load();
    const nextRecords = db.records.filter((record) => record.path !== path);

    if (nextRecords.length === db.records.length) {
      return;
    }

    await this.save({
      ...db,
      records: nextRecords,
    });
  }

  async clear(): Promise<void> {
    await this.save(this.createEmpty());
  }
}
