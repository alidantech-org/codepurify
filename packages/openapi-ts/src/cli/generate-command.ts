import { OpenApiTs } from "../api/openapi-ts.js";
import { CliMessage } from "./cli.constants.js";
import { loadPackageConfig } from "./load-package-config.js";

export async function runGenerateCommand(): Promise<number> {
  const api = new OpenApiTs();

  try {
    const config = await loadPackageConfig();
    const result = await api.generate({ config });

    if (!result.success) {
      console.error(CliMessage.failed);
      console.error(result.error);
      return 1;
    }

    for (const file of result.files) {
      console.log(CliMessage.generated(file));
    }

    console.log(CliMessage.done);
    return 0;
  } catch (error) {
    console.error(CliMessage.failed, error);
    return 1;
  }
}
