/**
 * Tempura Generator Orchestrator
 *
 * Main orchestrator that connects all generation components:
 * - Load config
 * - Discover entity folders
 * - Parse types/config
 * - Build context
 * - Generate context/index files
 * - Create backup session
 * - Write files
 * - Save manifest
 */

import { join, resolve } from 'node:path';
import { ensureDirectory } from '../utils';
import { createTempuraError, TempuraErrorCode } from './errors';
import { logger } from './logger';
import { BackupManager } from './backup-manager';
import { ManifestManager } from './manifest-manager';
import { FileWriter } from './file-writer';
import { RollbackManager } from './rollback-manager';
import { loadTempuraConfig } from '../config/config-loader';
import { discoverEntityFolders } from '../_generator/nest/parser/entity-folder-parser';
import { parseEntityConfigFile } from '../_generator/nest/parser/config-parser';
import { parseEntityTypesFile } from '../_generator/nest/parser/entity-parser';
import { buildNestEntityContext } from '../_generator/nest/context/nest-context-builder';
import { generateContextFile } from '../_generator/nest/generators/context.generator';
import { generateIndexFile } from '../_generator/nest/generators/index.generator';
import type { GeneratedFilePlan } from '../_generator/nest/generators/context.generator';
import type { TempuraConfig } from '../config/config.types';

/**
 * Generator options
 */
export interface GeneratorOptions {
  /** Root directory */
  rootDir: string;
  /** Tempura config file path */
  configFile?: string;
  /** Whether to generate only context files (MVP) */
  contextOnly?: boolean;
  /** Whether to skip backup */
  skipBackup?: boolean;
  /** Whether to skip manifest update */
  skipManifest?: boolean;
}

/**
 * Generation result
 */
export interface GenerationResult {
  /** Number of files generated */
  filesGenerated: number;
  /** Number of files skipped (unchanged) */
  filesSkipped: number;
  /** Backup session ID */
  backupSessionId?: string;
  /** Generation timestamp */
  generatedAt: string;
  /** Generated file plans */
  filePlans: GeneratedFilePlan[];
}

/**
 * Main generator orchestrator
 */
export class TempuraGenerator {
  private rootDir: string;
  private tempuraDir: string;
  private backupsDir: string;
  private manifestFile: string;

  constructor(private options: GeneratorOptions) {
    this.rootDir = resolve(options.rootDir);
    this.tempuraDir = join(this.rootDir, '.tempura');
    this.backupsDir = join(this.tempuraDir, 'backups');
    this.manifestFile = join(this.tempuraDir, 'manifest.json');
  }

  /**
   * Main generation entry point
   *
   * @returns Generation result
   * @throws TempuraError if generation fails
   */
  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting Tempura generation...');

      // 1. Load Tempura config
      const config = await this.loadConfig();

      // 2. Discover entity folders
      const entityFolders = await this.discoverEntityFolders();

      if (entityFolders.length === 0) {
        logger.warn('No entity folders found');
        return {
          filesGenerated: 0,
          filesSkipped: 0,
          generatedAt: new Date().toISOString(),
          filePlans: [],
        };
      }

      logger.info(`Found ${entityFolders.length} entity folders`);

      // 3. Parse entity data
      const parsedEntities = await this.parseEntities(entityFolders);

      // 4. Build entity contexts
      const entityContexts = await this.buildContexts(parsedEntities);

      // 5. Generate file plans (MVP: only context and index)
      const filePlans = await this.generateFilePlans(entityContexts);

      // 6. Create backup session
      let backupSessionId: string | undefined;
      if (!this.options.skipBackup) {
        backupSessionId = await this.createBackupSession(filePlans);
      }

      // 7. Write files
      const writeResults = await this.writeFiles(filePlans, backupSessionId);

      // 8. Update manifest
      if (!this.options.skipManifest) {
        await this.updateManifest(filePlans);
      }

      const duration = Date.now() - startTime;
      logger.success(`Generation completed in ${duration}ms: ${writeResults.generated} files written, ${writeResults.skipped} skipped`);

      return {
        filesGenerated: writeResults.generated,
        filesSkipped: writeResults.skipped,
        backupSessionId,
        generatedAt: new Date().toISOString(),
        filePlans,
      };
    } catch (error) {
      logger.error('Generation failed', error);
      throw createTempuraError(TempuraErrorCode.GENERATION_FAILED, 'Generation failed', { cause: error });
    }
  }

  /**
   * Loads Tempura configuration
   *
   * @returns Tempura config
   * @throws TempuraError if config loading fails
   */
  private async loadConfig(): Promise<TempuraConfig> {
    try {
      const configPath = this.options.configFile || join(this.rootDir, 'tempura.config.ts');
      const config = await loadTempuraConfig(configPath);
      logger.debug('Loaded Tempura config');
      return config;
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.CONFIG_NOT_FOUND, 'Failed to load Tempura config', {
        configFile: this.options.configFile,
        cause: error,
      });
    }
  }

  /**
   * Discovers entity folders
   *
   * @returns Array of discovered entity folders
   * @throws TempuraError if discovery fails
   */
  private async discoverEntityFolders() {
    try {
      const entityFolders = await discoverEntityFolders(this.rootDir);
      logger.debug(`Discovered ${entityFolders.length} entity folders`);
      return entityFolders;
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.GENERATION_FAILED, 'Failed to discover entity folders', { cause: error });
    }
  }

  /**
   * Parses entity data from folders
   *
   * @param entityFolders - Array of entity folders
   * @returns Array of parsed entities
   * @throws TempuraError if parsing fails
   */
  private async parseEntities(entityFolders: any[]) {
    const parsedEntities = [];

    for (const folder of entityFolders) {
      try {
        // Parse config file
        const config = await parseEntityConfigFile(folder.configFilePath);

        // Parse types file
        const entityType = await parseEntityTypesFile(folder.typesFilePath);

        parsedEntities.push({
          folder,
          config,
          entityType,
        });

        logger.debug(`Parsed entity: ${folder.entityName}`);
      } catch (error) {
        logger.error(`Failed to parse entity: ${folder.entityName}`, error);
        // Continue with other entities
      }
    }

    return parsedEntities;
  }

  /**
   * Builds entity contexts from parsed data
   *
   * @param parsedEntities - Array of parsed entities
   * @returns Array of entity contexts
   * @throws TempuraError if context building fails
   */
  private async buildContexts(parsedEntities: any[]) {
    const entityContexts = [];

    for (const parsed of parsedEntities) {
      try {
        const context = buildNestEntityContext(parsed.folder, parsed.config, parsed.entityType);
        entityContexts.push(context);
        logger.debug(`Built context for: ${parsed.folder.entityName}`);
      } catch (error) {
        logger.error(`Failed to build context for: ${parsed.folder.entityName}`, error);
        // Continue with other entities
      }
    }

    return entityContexts;
  }

  /**
   * Generates file plans from entity contexts
   *
   * @param entityContexts - Array of entity contexts
   * @returns Array of file plans
   * @throws TempuraError if plan generation fails
   */
  private async generateFilePlans(entityContexts: any[]): Promise<GeneratedFilePlan[]> {
    const filePlans: GeneratedFilePlan[] = [];

    for (const entityContext of entityContexts) {
      try {
        // Generate context file plan
        const contextPlan = await generateContextFile(entityContext);
        filePlans.push(contextPlan);

        // Generate index file plan
        const indexPlan = await generateIndexFile(entityContext, {
          components: {
            context: true,
            controller: false,
            service: false,
            module: false,
            entity: false,
            dto: false,
          },
        });
        filePlans.push(indexPlan);

        logger.debug(`Generated file plans for: ${entityContext.entity.names.pascal}`);
      } catch (error) {
        logger.error(`Failed to generate file plans for: ${entityContext.entity.names.pascal}`, error);
        // Continue with other entities
      }
    }

    return filePlans;
  }

  /**
   * Creates backup session for file plans
   *
   * @param filePlans - Array of file plans
   * @returns Backup session ID
   * @throws TempuraError if backup fails
   */
  private async createBackupSession(filePlans: GeneratedFilePlan[]): Promise<string> {
    try {
      // Ensure backups directory exists
      await ensureDirectory(this.backupsDir);

      const backupManager = new BackupManager(this.backupsDir);
      const session = await backupManager.createSession();

      // Backup all files
      for (const plan of filePlans) {
        const absolutePath = resolve(this.rootDir, plan.filePath);
        await backupManager.backupFile(session, absolutePath);
      }

      logger.info(`Created backup session: ${session.id}`);
      return session.id;
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.BACKUP_FAILED, 'Failed to create backup session', { cause: error });
    }
  }

  /**
   * Writes files from plans
   *
   * @param filePlans - Array of file plans
   * @param backupSessionId - Backup session ID
   * @returns Write results
   * @throws TempuraError if writing fails
   */
  private async writeFiles(filePlans: GeneratedFilePlan[], backupSessionId?: string) {
    try {
      // Ensure tempura directory exists
      await ensureDirectory(this.tempuraDir);

      const manifestManager = new ManifestManager(this.manifestFile);
      const backupManager = new BackupManager(this.backupsDir);

      // Always ensure we have a backup session
      let backupSession = backupSessionId ? await backupManager.loadSession(backupSessionId) : null;
      if (!backupSession) {
        backupSession = await backupManager.createSession();
      }

      const fileWriter = new FileWriter({
        rootDir: this.rootDir,
        backupManager,
        manifestManager,
      });

      const writeInputs = filePlans.map((plan) => ({
        filePath: plan.filePath,
        content: plan.content,
        source: plan.source,
        template: plan.template,
        immutable: plan.immutable,
        backupSession: backupSession!,
      }));

      const results = await fileWriter.writeGeneratedFiles(writeInputs);

      return {
        generated: results.filter((r) => r.written).length,
        skipped: results.filter((r) => !r.written).length,
      };
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.FILE_WRITE_FAILED, 'Failed to write files', { cause: error });
    }
  }

  /**
   * Updates manifest with generated files
   *
   * @param filePlans - Array of file plans
   * @throws TempuraError if manifest update fails
   */
  private async updateManifest(filePlans: GeneratedFilePlan[]) {
    try {
      const manifestManager = new ManifestManager(this.manifestFile);
      const manifest = await manifestManager.load();

      // Update manifest with new entries
      for (const plan of filePlans) {
        const absolutePath = resolve(this.rootDir, plan.filePath);
        const { hashContent } = await import('../utils');
        const hash = hashContent(plan.content);

        await manifestManager.upsertEntry({
          path: plan.filePath,
          absolutePath,
          source: plan.source,
          template: plan.template,
          hash,
          immutable: plan.immutable,
          generatedAt: new Date().toISOString(),
        });
      }

      logger.debug('Updated manifest');
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.MANIFEST_INVALID, 'Failed to update manifest', { cause: error });
    }
  }

  /**
   * Rolls back the last generation
   *
   * @throws TempuraError if rollback fails
   */
  async rollback(): Promise<void> {
    try {
      const manifestManager = new ManifestManager(this.manifestFile);
      const rollbackManager = new RollbackManager({
        backupsDir: this.backupsDir,
        manifestManager,
      });

      await rollbackManager.rollbackLatest();
      logger.success('Rollback completed');
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.ROLLBACK_FAILED, 'Failed to rollback', { cause: error });
    }
  }
}

/**
 * Convenience function to run generation
 *
 * @param options - Generator options
 * @returns Generation result
 */
export async function generate(options: GeneratorOptions): Promise<GenerationResult> {
  const generator = new TempuraGenerator(options);
  return generator.generate();
}

/**
 * Convenience function to rollback last generation
 *
 * @param rootDir - Root directory
 * @throws TempuraError if rollback fails
 */
export async function rollback(rootDir: string): Promise<void> {
  const generator = new TempuraGenerator({ rootDir });
  return generator.rollback();
}
