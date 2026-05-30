import { loadCodepotConfig } from '../config/load-codepot-config';
import { compilePackage } from '@/pipeline';

export interface InspectCommandOptions {
  readonly config?: string;
}

export async function runInspectCommand(
  options: InspectCommandOptions,
): Promise<void> {
  const config = await loadCodepotConfig({
    configPath: options.config,
  });

  const compiled = compilePackage(config);

  console.log(`contracts: ${compiled.contracts.length}`);

  for (const contract of compiled.contracts) {
    console.log(`- ${contract.key} v${contract.version}`);
    console.log(`  resources: ${Object.keys(contract.resources).length}`);
    console.log(`  primitives: ${Object.keys(contract.properties.primitives).length}`);
    console.log(`  enums: ${Object.keys(contract.properties.enums).length}`);
    console.log(`  composites: ${Object.keys(contract.properties.composites).length}`);
    console.log(`  entities: ${Object.keys(contract.schemas.entities).length}`);
    console.log(`  models: ${Object.keys(contract.schemas.models).length}`);
    console.log(`  dtos: ${Object.keys(contract.schemas.dtos).length}`);
    console.log(`  routes: ${Object.values(contract.resources).reduce((total, resource) => total + Object.keys(resource.routes).length, 0)}`);
  }
}
