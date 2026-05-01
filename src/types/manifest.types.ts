/**
 * Tempurify Manifest Types
 *
 * Types for Tempurify manifest tracking and backup/session management.
 * Provides contracts for file tracking and generation metadata.
 */

export interface TempurifyManifest {
  version: 1;
  generator: 'tempurify';
  generatedAt: string | null;
  entries: TempurifyManifestEntry[];
}

export interface TempurifyManifestEntry {
  path: string;
  absolutePath: string;
  source: string;
  template: string;
  hash: string;
  immutable: boolean;
  generatedAt: string;
}
