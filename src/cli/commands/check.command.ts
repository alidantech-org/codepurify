/**
 * Tempurify Check Command
 *
 * Checks generated files against manifest for drift detection.
 * Reports clean, changed, and missing files.
 */

import { Command } from 'commander';
import { intro, outro, spinner } from '@clack/prompts';
import { consola } from 'consola';
import { join } from 'node:path';
import Table from 'cli-table3';
import { fileExists, hashFile, hashContent } from '../../utils';
import { ManifestManager } from '../../core/manifest-manager';

/**
 * File check result
 */
interface FileCheckResult {
  path: string;
  status: 'clean' | 'changed' | 'missing';
  expectedHash?: string | null;
  actualHash?: string | null;
}

/**
 * Creates the check command
 */
export function createCheckCommand(): Command {
  const command = new Command('check').description('Check generated files against manifest for drift').action(async () => {
    try {
      intro('🔍 Tempurify Check');

      const rootDir = process.cwd();
      const manifestPath = join(rootDir, '.tempurify', 'manifest.json');

      // Check if manifest exists
      if (!(await fileExists(manifestPath))) {
        consola.error('Manifest not found. Run: tempurify init');
        process.exit(1);
      }

      // Load manifest
      const s = spinner();
      s.start('Loading manifest');

      const manifestManager = new ManifestManager(manifestPath);
      const manifest = await manifestManager.load();

      s.stop(`Loaded manifest with ${manifest.entries.length} entries`);

      if (manifest.entries.length === 0) {
        consola.warn('No generated files in manifest');
        outro('Nothing to check');
        return;
      }

      // Check each file
      s.start('Checking files');

      const results: FileCheckResult[] = [];

      for (const entry of manifest.entries) {
        const absolutePath = join(rootDir, entry.path);
        const exists = await fileExists(absolutePath);

        if (!exists) {
          results.push({
            path: entry.path,
            status: 'missing',
            expectedHash: entry.hash,
          });
          continue;
        }

        const actualHash = await hashFile(absolutePath);
        const expectedHash = entry.hash;

        if (actualHash === expectedHash) {
          results.push({
            path: entry.path,
            status: 'clean',
            expectedHash,
            actualHash,
          });
        } else {
          results.push({
            path: entry.path,
            status: 'changed',
            expectedHash,
            actualHash,
          });
        }
      }

      s.stop('File check complete');

      // Count results
      const clean = results.filter((r) => r.status === 'clean').length;
      const changed = results.filter((r) => r.status === 'changed').length;
      const missing = results.filter((r) => r.status === 'missing').length;

      // Show summary
      consola.info(`Total files: ${results.length}`);
      consola.success(`Clean: ${clean}`);
      if (changed > 0) {
        consola.warn(`Changed: ${changed}`);
      }
      if (missing > 0) {
        consola.error(`Missing: ${missing}`);
      }

      // Show table
      if (changed > 0 || missing > 0) {
        const table = new Table({
          head: ['File', 'Status', 'Expected Hash', 'Actual Hash'],
          colWidths: [50, 10, 12, 12],
        });

        results.forEach((result) => {
          if (result.status !== 'clean') {
            table.push([
              result.path,
              result.status,
              result.expectedHash?.substring(0, 8) || 'N/A',
              result.actualHash?.substring(0, 8) || 'N/A',
            ]);
          }
        });

        console.log(table.toString());
      }

      if (changed === 0 && missing === 0) {
        outro('✨ All files are clean');
      } else {
        outro('⚠️  Some files have drifted');
      }
    } catch (error) {
      consola.error('Check failed:', error);
      process.exit(1);
    }
  });

  return command;
}
