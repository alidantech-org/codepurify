import { writeFile } from 'node:fs/promises';

import { ensureDirectory } from './ensure-directory';

export interface WriteTextFileOptions {
  readonly path: string;
  readonly content: string;
}

export async function writeTextFile(options: WriteTextFileOptions): Promise<void> {
  const directory = options.path.split(/[\\/]/).slice(0, -1).join('/');

  if (directory.length > 0) {
    await ensureDirectory(directory);
  }

  await writeFile(options.path, options.content, 'utf8');
}
