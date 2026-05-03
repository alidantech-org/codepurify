/**
 * Codepurify Assets
 *
 * Handles reading of package-embedded template assets.
 * These are starter templates that ship with the package.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

export class CodepurifyAssets {
  /**
   * Read an init template asset from the package.
   *
   * @param path - Relative path to the template asset
   * @returns Template content as string
   */
  async readInitTemplate(path: string): Promise<string> {
    const candidates = [
      // Development: check source directory first
      join(currentDir, '../../../templates/init', path),
      join(currentDir, '../../../../templates/init', path),
      // Production: check dist directory
      join(currentDir, '../../templates/init', path),
      join(currentDir, '../templates/init', path),
    ];

    for (const candidate of candidates) {
      try {
        return await readFile(candidate, 'utf-8');
      } catch {
        // try next candidate
      }
    }

    throw new Error(`Init template asset not found: ${path}. Tried: ${candidates.join(', ')}`);
  }
}
