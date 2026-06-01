import { stringify } from 'yaml';

import type { CodepotConfig } from '@/contract/types/authoring/1.codepot-config.types';
import { emitDebugPackage } from './emit-debug-package';

export function writeDebugPackageJson(config: CodepotConfig): string {
  return `${JSON.stringify(emitDebugPackage(config), null, 2)}\n`;
}

export function writeDebugPackageYaml(config: CodepotConfig): string {
  return stringify(emitDebugPackage(config));
}
