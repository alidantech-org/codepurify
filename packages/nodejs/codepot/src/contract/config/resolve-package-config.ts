import { resolveOutputConfig } from '@/app/runtime/output/resolve-output-config';
import type { PackageConfig, OpenApiValidationConfig } from './package-config.types';
import { resolveCompileOptions } from './resolve-compile-options';

const defaultValidationConfig: OpenApiValidationConfig = {
  enabled: true,
  failOnWarnings: false,
  allowUnusedComponents: true,
};

const defaultLoggingConfig = {
  level: 'normal' as const,
};

export function resolvePackageConfig(config: PackageConfig) {
  return {
    contracts: config.contracts,
    output: resolveOutputConfig(config.output),
    compile: resolveCompileOptions(config),
    validation: {
      ...defaultValidationConfig,
      ...config.validation,
    },
    logging: {
      ...defaultLoggingConfig,
      ...config.logging,
    },
  };
}
