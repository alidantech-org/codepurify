import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import type { CodepotConfig } from '@/contract/types/core/1.codepot-config.types';

export interface LoadCodepotConfigOptions {
  readonly configPath?: string;
}

export async function loadCodepotConfig(options: LoadCodepotConfigOptions = {}): Promise<CodepotConfig> {
  const configPath = resolve(options.configPath ?? 'examples/codepot.config.example.ts');
  const moduleUrl = pathToFileURL(configPath).href;

  const loaded = await import(moduleUrl);

  const config = loaded.default ?? loaded.config ?? loaded.codepotConfig;

  if (!config) {
    throw new Error(`No Codepot config export found in ${configPath}. Expected default export, config, or codepotConfig.`);
  }

  return config as CodepotConfig;
}
