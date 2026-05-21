import type { PackageConfig } from "./package-config.types.js";
import { resolveOutputConfig } from "../output/resolve-output-config";
import { resolveCompileOptions } from "./resolve-compile-options";

export function resolvePackageConfig(config: PackageConfig) {
  return {
    contracts: config.contracts,
    output: resolveOutputConfig(config.output),
    compile: resolveCompileOptions(config),
  };
}
