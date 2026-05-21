import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
import { DefaultConfigFileName } from "./cli.constants.js";
import type { PackageConfig } from "../config/package-config.types.js";

const require = createRequire(import.meta.url);
let tsxRegistered = false;

export async function loadPackageConfig(
  cwd = process.cwd(),
  fileName = DefaultConfigFileName,
): Promise<PackageConfig> {
  registerTsx();

  const configPath = path.resolve(cwd, fileName);
  const moduleUrl = pathToFileURL(configPath).href;
  const loaded = await import(moduleUrl);

  return loaded.default as PackageConfig;
}

function registerTsx(): void {
  if (tsxRegistered) return;

  require("tsx/cjs");
  tsxRegistered = true;
}
