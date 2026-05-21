import type { CompileOptions } from "../compiler/compile-options.types.js";
import type { VersionBuilder } from "../version/define-version-contract";

export const PackageOutputFormat = {
  json: "json",
  yaml: "yaml",
} as const;

export type PackageOutputFormat =
  (typeof PackageOutputFormat)[keyof typeof PackageOutputFormat];

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

export interface PackageConfig {
  readonly contracts: readonly VersionBuilder[];
  readonly output?: Partial<PackageOutputConfig>;
  readonly server?: PackageServerConfig;
  readonly compile?: CompileOptions;
}
