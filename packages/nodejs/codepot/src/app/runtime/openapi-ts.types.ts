import type { PackageConfig } from '@/contract/config/package-config.types';
import { GenerateOpenApiResult } from '@/pipeline/targets/openapi/generator/generate-openapi';
import { Logger } from '@/utils/logger/logging/logger.types';

export interface InitConfigInput {
  readonly cwd?: string;
  readonly fileName?: string;
  readonly force?: boolean;
}

export interface InitConfigResult {
  readonly success: boolean;
  readonly filePath?: string;
  readonly skipped?: boolean;
  readonly error?: unknown;
}

export interface GenerateInput {
  readonly config: PackageConfig;
  readonly logger?: Logger;
}

export type GenerateResult = GenerateOpenApiResult;

export interface CodePotApi {
  initConfig(input?: InitConfigInput): Promise<InitConfigResult>;
  generate(input: GenerateInput): Promise<GenerateResult>;
}
