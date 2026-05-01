/**
 * Tempura Manifest Types
 *
 * Types for Tempura manifest tracking and backup/session management.
 * Provides contracts for file tracking and generation metadata.
 */

export interface TempuraManifest {
  version: 1;
  generator: 'tempura';
  generatedAt: string | null;
  entries: TempuraManifestEntry[];
}

export interface TempuraManifestEntry {
  path: string;
  absolutePath: string;
  source: string;
  template: string;
  hash: string;
  immutable: boolean;
  generatedAt: string;
}
