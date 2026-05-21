import type { PackageConfig } from "./package-config.types.js";
import { resolveOutputConfig } from "../output/resolve-output-config.js";
import { resolveCompileOptions } from "./resolve-compile-options.js";

export function resolvePackageConfig(config: PackageConfig) {
  return {
    contracts: config.contracts,
    output: resolveOutputConfig(config.output),
    compile: resolveCompileOptions(config),
  };
}
