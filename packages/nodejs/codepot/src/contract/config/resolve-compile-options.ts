import { CompileOptions } from '@/pipeline/compiler/compile-options.types';
import type { PackageConfig } from './package-config.types';

export function resolveCompileOptions(config: PackageConfig): CompileOptions {
  return {
    ...config.compile,
    servers: config.server
      ? [
          {
            url: config.server.url,
            description: config.server.description,
          },
        ]
      : config.compile?.servers,
  };
}
