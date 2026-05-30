import { defineCodepotConfig, defineVersionContract, property, field, query, access, persistence, security, transport } from './contract';

import {
  compilePackage,
  compileVersionContract,
  writePackage,
  writeFiles,
  writeCodepotPackage,
  writeCodepotJson,
  writeCodepotYaml,
} from './pipeline';

import type { CodepotConfig } from './contract/types/core/1.codepot-config.types';
import type { VersionBuilder } from './contract/types/core/2.version-builder';
import type { CodepotDefinition } from './contract/types/definition';

import type { PackageWriteResult } from './pipeline/writer/write-package';

import type { WriteCodepotPackageOptions } from './pipeline/writer/write-codepot-package';

export interface CodepotRuntimeState {
  readonly configs: readonly CodepotConfig[];
  readonly versions: readonly VersionBuilder[];
}

export interface CodepotRuntime {
  readonly state: CodepotRuntimeState;

  config(config: CodepotConfig): CodepotConfig;

  version(options: Parameters<typeof defineVersionContract>[0]): VersionBuilder;

  addConfig(config: CodepotConfig): CodepotRuntime;

  addVersion(version: VersionBuilder): CodepotRuntime;

  compileConfig(config: CodepotConfig): ReturnType<typeof compilePackage>;

  compileVersion(version: VersionBuilder): CodepotDefinition;

  compileAll(): readonly CodepotDefinition[];

  plan(config: CodepotConfig): PackageWriteResult;

  write(config: CodepotConfig, options?: WriteCodepotPackageOptions): ReturnType<typeof writeCodepotPackage>;

  reset(): CodepotRuntime;
}

export function createCodepotRuntime(): CodepotRuntime {
  const configs: CodepotConfig[] = [];
  const versions: VersionBuilder[] = [];

  const runtime: CodepotRuntime = {
    get state() {
      return {
        configs,
        versions,
      };
    },

    config(config) {
      const codepotConfig = defineCodepotConfig(config);
      configs.push(codepotConfig);
      return codepotConfig;
    },

    version(options) {
      const version = defineVersionContract(options);
      versions.push(version);
      return version;
    },

    addConfig(config) {
      configs.push(config);
      return runtime;
    },

    addVersion(version) {
      versions.push(version);
      return runtime;
    },

    compileConfig(config) {
      return compilePackage(config);
    },

    compileVersion(version) {
      return compileVersionContract(version);
    },

    compileAll() {
      return [
        ...versions.map((version) => compileVersionContract(version)),
        ...configs.flatMap((config) => compilePackage(config).contracts),
      ];
    },

    plan(config) {
      return writePackage(config);
    },

    async write(config, options = {}) {
      return writeCodepotPackage(config, options);
    },

    reset() {
      configs.length = 0;
      versions.length = 0;
      return runtime;
    },
  };

  return runtime;
}

export const codepot = {
  createRuntime: createCodepotRuntime,

  defineCodepotConfig,
  defineVersionContract,

  property,
  field,
  query,
  access,
  persistence,

  security,
  transport,

  compilePackage,
  compileVersionContract,

  writePackage,
  writeFiles,
  writeCodepotPackage,
  writeCodepotJson,
  writeCodepotYaml,
} as const;
