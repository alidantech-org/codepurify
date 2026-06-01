// src/app/emit-ir.ts

import type { CodepotConfig } from '@/contract/types/authoring/1.codepot-config.types';
import type { VersionAuthoringState } from '@/contract/types/authoring/2.version-builder';
import type { CodepotDefinition } from '@/contract/types/ir/definition';

import { compile } from '@/compiler';

import { createFileSystemManager, type FileSystemManager } from '@/utils/filesystem';

import { serializeJson, serializeYaml } from '@/utils/serializers';

// ============================================================================
// TYPES
// ============================================================================

export interface EmitIrPackage {
  readonly contracts: readonly CodepotDefinition[];
}

export interface WriteIrPackageOptions {
  readonly file_system?: FileSystemManager;
}

export interface WriteIrPackageResult {
  readonly files: readonly string[];
}

// ============================================================================
// FILE NAMES
// ============================================================================

/**
 * Creates the canonical IR JSON filename for one compiled contract.
 *
 * Example:
 * - version 1 -> codepot.v1.json
 * - version 2 -> codepot.v2.json
 */
export function createIrJsonFileName(ir: CodepotDefinition): string {
  return `codepot.v${ir.version}.json`;
}

/**
 * Creates the canonical IR YAML filename for one compiled contract.
 */
export function createIrYamlFileName(ir: CodepotDefinition): string {
  return `codepot.v${ir.version}.yaml`;
}

// ============================================================================
// EMIT
// ============================================================================

/**
 * Compiles one authoring contract into Codepot IR.
 */
export function emitIrContract(contract: VersionAuthoringState): CodepotDefinition {
  return compile(contract);
}

/**
 * Compiles all contracts from a Codepot config into IR.
 */
export function emitIrPackage(config: CodepotConfig): EmitIrPackage {
  return {
    contracts: config.contracts.map((contract) => emitIrContract(contract.snapshot())),
  };
}

// ============================================================================
// SERIALIZE
// ============================================================================

/**
 * Serializes one compiled IR contract as JSON.
 */
export function serializeIrContractJson(ir: CodepotDefinition): string {
  return serializeJson(ir);
}

/**
 * Serializes one compiled IR contract as YAML.
 */
export function serializeIrContractYaml(ir: CodepotDefinition): string {
  return serializeYaml(ir);
}

/**
 * Serializes the compiled IR package as JSON.
 */
export function serializeIrPackageJson(config: CodepotConfig): string {
  return serializeJson(emitIrPackage(config));
}

/**
 * Serializes the compiled IR package as YAML.
 */
export function serializeIrPackageYaml(config: CodepotConfig): string {
  return serializeYaml(emitIrPackage(config));
}

// ============================================================================
// WRITE
// ============================================================================

/**
 * Compiles a Codepot config and writes one IR JSON/YAML pair per contract.
 *
 * For v1, this writes:
 * - codepot.v1.json
 * - codepot.v1.yaml
 */
export async function writeIrPackage(config: CodepotConfig, options: WriteIrPackageOptions = {}): Promise<WriteIrPackageResult> {
  const fileSystem = options.file_system ?? createFileSystemManager();

  const folder = config.output?.folder ?? 'debug';

  await fileSystem.ensureDirectory(folder);

  const files: string[] = [];

  for (const contract of config.contracts) {
    const ir = emitIrContract(contract.snapshot());

    const jsonPath = fileSystem.joinPath(folder, createIrJsonFileName(ir));
    const yamlPath = fileSystem.joinPath(folder, createIrYamlFileName(ir));

    await fileSystem.writeTextFile({
      path: jsonPath,
      content: serializeIrContractJson(ir),
    });

    await fileSystem.writeTextFile({
      path: yamlPath,
      content: serializeIrContractYaml(ir),
    });

    files.push(fileSystem.toPosixPath(jsonPath));
    files.push(fileSystem.toPosixPath(yamlPath));
  }

  return {
    files,
  };
}
