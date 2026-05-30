import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { writeFiles } from '@/index';
import { createTempDir, removeTempDir } from '../../utils/temp-dir';

describe('writeFiles', () => {
  it('writes files to disk', async () => {
    const dir = await createTempDir();

    try {
      const path = join(dir, 'codepot.json');

      const result = await writeFiles({
        files: [
          {
            path,
            content: '{"ok":true}\n',
          },
        ],
      });

      expect(result.files[0].changed).toBe(true);
      expect(existsSync(path)).toBe(true);
      expect(await readFile(path, 'utf8')).toBe('{"ok":true}\n');
    } finally {
      await removeTempDir(dir);
    }
  });

  it('supports dry run', async () => {
    const dir = await createTempDir();

    try {
      const path = join(dir, 'dry.json');

      const result = await writeFiles(
        {
          files: [
            {
              path,
              content: '{}\n',
            },
          ],
        },
        {
          dryRun: true,
        },
      );

      expect(result.files[0].dryRun).toBe(true);
      expect(existsSync(path)).toBe(false);
    } finally {
      await removeTempDir(dir);
    }
  });
});
