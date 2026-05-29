import { CodepotDefinition } from '@/contract/types/definition';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DEFAULT_CONFIG_FILE = 'package.config.ts';

// ============================================================================
// INPUT / OUTPUT TYPES
// ============================================================================

export interface InitConfigInput {
  /** Working directory to place the config file. Defaults to process.cwd() */
  cwd?: string;
  /** Config filename. Defaults to package.config.ts */
  fileName?: string;
  /** Overwrite existing config if present */
  force?: boolean;
}

export interface InitConfigResult {
  success: boolean;
  filePath?: string;
  skipped?: boolean; // file already existed and force was false
  error?: unknown;
}

export interface GenerateInput {
  /** Resolved codepot definition to generate from */
  definition: CodepotDefinition;
  /** Output directory for generated files */
  outDir?: string;

  /** Dry run — resolve but do not write */
  dryRun?: boolean;
}

export interface GenerateResult {
  success: boolean;
  files?: GeneratedFile[];
  error?: unknown;
}

export interface GeneratedFile {
  filePath: string;
  content: string;
  type: 'openapi' | 'types' | 'client' | 'server';
}

// ============================================================================
// CODEPOT CLASS
// ============================================================================

export class CodePot {
  // --------------------------------------------------------------------------
  // init
  // --------------------------------------------------------------------------

  async init(input: InitConfigInput = {}): Promise<InitConfigResult> {
    const cwd = input.cwd ?? process.cwd();
    const fileName = input.fileName ?? DEFAULT_CONFIG_FILE;
    const filePath = path.join(cwd, fileName);

    if (fs.existsSync(filePath) && !input.force) {
      return { success: true, filePath, skipped: true };
    }

    try {
      const template = fs.readFileSync(this.templatePath(), 'utf-8');
      fs.writeFileSync(filePath, template, 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error };
    }
  }

  // --------------------------------------------------------------------------
  // generate
  // --------------------------------------------------------------------------

  async generate(input: GenerateInput): Promise<GenerateResult> {
    try {
      const files: GeneratedFile[] = [];

      if (!input.dryRun && input.outDir) {
        fs.mkdirSync(input.outDir, { recursive: true });
        for (const file of files) {
          fs.writeFileSync(file.filePath, file.content, 'utf-8');
        }
      }

      return { success: true, files };
    } catch (error) {
      return { success: false, error };
    }
  }

  private templatePath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, './configs/package.config.template.ts');
  }
}
