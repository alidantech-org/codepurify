import type { CompileOptions } from '@/pipeline/compiler/compile-options.types';
import type { VersionBuilder } from '@/contract/version/define-version-contract';
import { LoggerConfig } from '@/utils/logger';

export const PackageOutputFormat = {
  json: 'json',
  yaml: 'yaml',
} as const;

export type PackageOutputFormat = (typeof PackageOutputFormat)[keyof typeof PackageOutputFormat];

export interface PackageOutputConfig {
  readonly folder: string;
  readonly filePrefix: string;
  readonly formats: readonly PackageOutputFormat[];
  readonly debugFilePrefix?: string;
}

export interface PackageServerConfig {
  readonly url: string;
  readonly description?: string;
}

export interface OpenApiValidationConfig {
  readonly enabled?: boolean;
  readonly failOnWarnings?: boolean;
  readonly allowUnusedComponents?: boolean;
}

export interface PackageConfig {
  readonly contracts: readonly VersionBuilder[];
  readonly output?: Partial<PackageOutputConfig>;
  readonly server?: PackageServerConfig;
  readonly compile?: CompileOptions;
  readonly validation?: OpenApiValidationConfig;
  readonly logging?: LoggerConfig;
}
