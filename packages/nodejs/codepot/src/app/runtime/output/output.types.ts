import type { PackageOutputFormat } from '@/contract/config/package-config.types';

export interface ResolvedOutputConfig {
  readonly folder: string;
  readonly filePrefix: string;
  readonly debugFilePrefix: string;
  readonly formats: readonly PackageOutputFormat[];
}

export interface OutputFileResult {
  readonly path: string;
  readonly format: PackageOutputFormat;
}
