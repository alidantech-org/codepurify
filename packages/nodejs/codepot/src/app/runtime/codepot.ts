import fs from 'fs';
import path from 'path';
import { generateOpenApi } from '@/pipeline/targets/openapi/generator/generate-openapi';
import { CodePotApi, GenerateInput, GenerateResult, InitConfigInput, InitConfigResult } from './codepot.types';

const DefaultConfigFileName = 'package.config.ts';

export class CodePot implements CodePotApi {
  async initConfig(input: InitConfigInput = {}): Promise<InitConfigResult> {
    const cwd = input.cwd ?? process.cwd();
    const fileName = input.fileName ?? DefaultConfigFileName;
    const filePath = path.join(cwd, fileName);

    if (fs.existsSync(filePath) && !input.force) {
      return {
        success: true,
        filePath,
        skipped: true,
      };
    }

    try {
      fs.writeFileSync(filePath, createDefaultConfig(), 'utf-8');

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async generate(input: GenerateInput): Promise<GenerateResult> {
    return generateOpenApi(input.config, input.logger);
  }
}

function createDefaultConfig(): string {
  return ["import { definePackageConfig } from 'codepot';", '', 'export default definePackageConfig({', '  contracts: [],', '});', ''].join(
    '\n',
  );
}
