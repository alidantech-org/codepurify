import { OpenApiTs } from "../api/openapi-ts.js";
import { CliMessage } from "./cli.constants.js";

export async function runInitCommand(): Promise<number> {
  const api = new OpenApiTs();
  const result = await api.initConfig();

  if (!result.success) {
    console.error(CliMessage.failed, result.error);
    return 1;
  }

  if (result.skipped && result.filePath) {
    console.log(CliMessage.skipped(result.filePath));
    return 0;
  }

  if (result.filePath) {
    console.log(CliMessage.initialized(result.filePath));
  }

  return 0;
}
