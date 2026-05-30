import { loadCodepotConfig } from '../config/load-codepot-config';
import { writeCodepotPackage } from '@/pipeline';

export interface BuildCommandOptions {
  readonly config?: string;
  readonly dryRun?: boolean;
}

export async function runBuildCommand(options: BuildCommandOptions): Promise<void> {
  const config = await loadCodepotConfig({
    configPath: options.config,
  });

  const result = await writeCodepotPackage(config, {
    dryRun: options.dryRun,
  });

  for (const file of result.files) {
    const label = file.dryRun ? 'planned' : 'written';
    console.log(`${label}: ${file.path}`);
  }
}
