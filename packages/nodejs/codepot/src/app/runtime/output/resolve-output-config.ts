import type { PackageOutputConfig } from '@/contract/config/package-config.types';
import { DefaultOutputConfig } from './output.constants';
import type { ResolvedOutputConfig } from './output.types';

export function resolveOutputConfig(
  config?: Partial<PackageOutputConfig>,
): ResolvedOutputConfig {
  return {
    folder: config?.folder ?? DefaultOutputConfig.folder,
    filePrefix: config?.filePrefix ?? DefaultOutputConfig.filePrefix,
    debugFilePrefix:
      config?.debugFilePrefix ?? DefaultOutputConfig.debugFilePrefix,
    formats: config?.formats ?? DefaultOutputConfig.formats,
  };
}
