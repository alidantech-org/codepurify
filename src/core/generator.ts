/**
 * Tempurify Generator Orchestrator
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
import { createTempurifyError, TempurifyErrorCode } from './errors';
import { logger } from './logger';
import { ensureTempurifyFolders, saveEntityMetadata, type EntityMetadata } from './tempurify-folder';
import { BackupManager } from './backup-manager';
import { ManifestManager } from './manifest-manager';
import { FileWriter } from './file-writer';
import { RollbackManager } from './rollback-manager';
import { loadTempurifyConfig } from '../config/config-loader';
import { discoverEntityFolders } from '../_generator/nest/parser/entity-folder-parser';
import { parseEntityConfigFile, convertToParsedConfig } from '../_generator/nest/parser/config-parser';
import { loadEntityConfigFile as loadExecutableEntityConfigFile } from '../_generator/nest/parser/entity-config-loader';
import { parseEntityTypesFile } from '../_generator/nest/parser/entity-parser';
import { buildNestEntityContext } from '../_generator/nest/context/nest-context-builder';
import { generateContextFile } from '../_generator/nest/generators/context.generator';
import { generateIndexFile } from '../_generator/nest/generators/index.generator';
import { generateTypeOrmEntity } from '../_generator/nest/generators/entity.generator';
import type { GeneratedFilePlan } from '../types/generator.types';
import type { TempurifyConfig } from '../config/config.types';
import type { DiscoveredEntityFolder } from '../_generator/nest/parser/entity-folder-parser';

/**
 * Generator options
 */
export interface GeneratorOptions {
  /** Root directory */
  rootDir: string;
  /** Tempurify config file path */
  configFile?: string;
  /** Pre-discovered entity folders (optional) */
  entities?: DiscoveredEntityFolder[];
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
export class TempurifyGenerator {
  private rootDir: string;
  private tempurifyDir: string;
  private backupsDir: string;
  private manifestFile: string;

  constructor(private options: GeneratorOptions) {
    this.rootDir = resolve(options.rootDir);
    this.tempurifyDir = join(this.rootDir, '.tempurify');
    this.backupsDir = join(this.tempurifyDir, 'backups');
    this.manifestFile = join(this.tempurifyDir, 'manifest.json');
  }

  /**
   * Main generation entry point
   *
   * @returns Generation result
   * @throws TempurifyError if generation fails
   */
  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting Tempurify generation...');

      // 1. Load Tempurify config
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
      throw createTempurifyError(TempurifyErrorCode.GENERATION_FAILED, 'Generation failed', { cause: error });
    }
  }

  /**
   * Loads Tempurify configuration
   *
   * @returns Tempurify config
   * @throws TempurifyError if config loading fails
   */
  private async loadConfig(): Promise<TempurifyConfig> {
    try {
      const configPath = this.options.configFile || join(this.rootDir, 'tempurify.config.ts');
      const config = await loadTempurifyConfig(configPath);
      logger.debug('Loaded Tempurify config');
      return config;
    } catch (error) {
      throw createTempurifyError(TempurifyErrorCode.CONFIG_NOT_FOUND, 'Failed to load Tempurify config', {
        configFile: this.options.configFile,
        cause: error,
      });
    }
  }

  /**
   * Discovers entity folders
   *
   * @returns Array of discovered entity folders
   * @throws TempurifyError if discovery fails
   */
  private async discoverEntityFolders() {
    try {
      // Use passed entities if available, otherwise discover them
      const entityFolders =
        this.options.entities && this.options.entities.length > 0 ? this.options.entities : await discoverEntityFolders(this.rootDir);

      logger.debug(`Using ${entityFolders.length} entity folders`);
      return entityFolders;
    } catch (error) {
      throw createTempurifyError(TempurifyErrorCode.GENERATION_FAILED, 'Failed to discover entity folders', { cause: error });
    }
  }

  /**
   * Parse entity configuration files
   *
   * @param folders - Array of discovered entity folders
   * @returns Array of parsed entities
   * @throws Error if parsing fails
   */
  private async parseEntities(folders: any[]): Promise<any[]> {
    const parsedEntities = [];

    for (const folder of folders) {
      try {
        // Use executable config loader for proper resolution of imports and spreads
        const loadedConfig = await loadExecutableEntityConfigFile(folder.configFilePath);
        const config = convertToParsedConfig(loadedConfig, folder.configFilePath);
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
   * Builds entity contexts from parsed entities
   *
   * @param parsedEntities - Array of parsed entities
   * @returns Array of entity contexts
   * @throws TempurifyError if context building fails
   */
  private async buildContexts(parsedEntities: any[]) {
    const entityContexts = [];
    const tempurifyFolders = await ensureTempurifyFolders(this.rootDir);

    for (const parsed of parsedEntities) {
      try {
        const context = buildNestEntityContext(parsed.folder, parsed.config, parsed.entityType);
        entityContexts.push(context);

        // Save entity metadata to .tempurify/context/entities/
        const metadata: EntityMetadata = {
          entityName: context.entity.names.kebab,
          updatedAt: new Date().toISOString(),
          folderPath: context.entity.files.folderPath,
          names: context.entity.names,
          files: {
            typesFile: context.entity.files.typesFile,
            contextFile: context.entity.files.contextFile,
            indexFile: context.entity.files.indexFile,
            configFile: context.entity.files.configFile,
            folderPath: context.entity.files.folderPath,
          },
          exports: {
            interfaceName: context.entity.exports.interfaceName,
            contextName: context.entity.exports.fieldsExportName,
            indexName: context.entity.exports.metaExportName,
            fieldsExportName: context.entity.exports.fieldsExportName,
            metaExportName: context.entity.exports.metaExportName,
            dbExportName: context.entity.exports.dbExportName,
          },
          config: parsed.config, // Use loaded config from executable module
          fields: {
            groups: {
              all: context.fields.groups.all.map((f: any) => f.name),
              filterable: context.fields.selection.filterable,
              creatable: context.fields.mutation.creatable,
              updatable: context.fields.mutation.updatable,
            },
            metadata: {
              relationKeys: context.fields.relationKeys,
            },
          },
          relations: {
            groups: {
              all: context.relations.groups.all.map((r: any) => r.name),
              hasMany: context.relations.groups.oneToMany.map((r: any) => r.name),
              hasOne: context.relations.groups.oneToOne.map((r: any) => r.name),
              belongsTo: context.relations.groups.manyToOne.map((r: any) => r.name),
            },
            metadata: {
              relationKeys: context.relations.relationKeys,
            },
          },
          generation: {
            lastGenerated: new Date().toISOString(),
            filesGenerated: [],
          },
        };

        await saveEntityMetadata(tempurifyFolders, context.entity.names.kebab, metadata);
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
   * @throws TempurifyError if plan generation fails
   */
  private async generateFilePlans(entityContexts: any[]): Promise<GeneratedFilePlan[]> {
    const filePlans: GeneratedFilePlan[] = [];
    const config = await this.loadConfig();

    for (const entityContext of entityContexts) {
      try {
        // Generate context file plan
        const contextPlan = await generateContextFile(entityContext, {
          config,
          rootDir: this.rootDir,
        });
        filePlans.push(contextPlan);

        // Generate entity file plan (if not context-only)
        if (!this.options.contextOnly) {
          const entityPlan = await generateTypeOrmEntity(entityContext, {
            config,
            rootDir: this.rootDir,
            debug: false,
          });
          filePlans.push(entityPlan);
        }

        // Generate index file plan
        const indexPlan = await generateIndexFile(entityContext, {
          config,
          rootDir: this.rootDir,
          components: {
            context: true,
            controller: false,
            service: false,
            module: false,
            entity: !this.options.contextOnly,
            dto: false,
          },
        });
        filePlans.push(indexPlan);

        logger.debug(`Generated file plans for: ${entityContext.entity.names.pascal}`);
      } catch (error) {
        logger.error(`Failed to generate file plans for: ${entityContext.entity.names.pascal}`, error);
        // Fail the entire generation if any entity fails
        throw createTempurifyError(
          TempurifyErrorCode.GENERATION_FAILED,
          `Failed to generate file plans for entity: ${entityContext.entity.names.pascal}`,
          { cause: error },
        );
      }
    }

    return filePlans;
  }

  /**
   * Creates backup session for file plans
   *
   * @param filePlans - Array of file plans
   * @returns Backup session ID
   * @throws TempurifyError if backup fails
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
      throw createTempurifyError(TempurifyErrorCode.BACKUP_FAILED, 'Failed to create backup session', { cause: error });
    }
  }

  /**
   * Writes files from plans
   *
   * @param filePlans - Array of file plans
   * @param backupSessionId - Backup session ID
   * @returns Write results
   * @throws TempurifyError if writing fails
   */
  private async writeFiles(filePlans: GeneratedFilePlan[], backupSessionId?: string) {
    try {
      console.log('DEBUG: writeFiles called with', filePlans.length, 'file plans');
      console.log(
        'DEBUG: filePlans:',
        filePlans.map((p) => ({ filePath: p.filePath, contentLength: p.content?.length || 0 })),
      );

      // Ensure tempurify directory exists
      await ensureDirectory(this.tempurifyDir);
      console.log('DEBUG: tempurify directory ensured:', this.tempurifyDir);

      const manifestManager = new ManifestManager(this.manifestFile);
      const backupManager = new BackupManager(this.backupsDir);
      console.log('DEBUG: manifest and backup managers created');

      // Always ensure we have a backup session
      let backupSession = backupSessionId ? await backupManager.loadSession(backupSessionId) : null;
      if (!backupSession) {
        console.log('DEBUG: creating new backup session');
        backupSession = await backupManager.createSession();
      }
      console.log('DEBUG: backup session created/loaded:', backupSession?.id);

      const fileWriter = new FileWriter({
        rootDir: this.rootDir,
        backupManager,
        manifestManager,
      });
      console.log('DEBUG: file writer created');

      const writeInputs = filePlans.map((plan) => ({
        filePath: plan.filePath,
        content: plan.content,
        source: plan.source,
        template: plan.template,
        immutable: plan.immutable,
        backupSession: backupSession!,
      }));
      console.log('DEBUG: writeInputs prepared:', writeInputs.length);

      console.log('DEBUG: calling fileWriter.writeGeneratedFiles...');
      const results = await fileWriter.writeGeneratedFiles(writeInputs);
      console.log('DEBUG: fileWriter.writeGeneratedFiles completed, results:', results);

      const result = {
        generated: results.filter((r) => r.written).length,
        skipped: results.filter((r) => !r.written).length,
      };
      console.log('DEBUG: writeFiles returning:', result);
      return result;
    } catch (error) {
      console.log('DEBUG: writeFiles error:', error);
      console.log('DEBUG: error type:', typeof error);
      console.log('DEBUG: error message:', error instanceof Error ? error.message : String(error));
      console.log('DEBUG: error stack:', error instanceof Error ? error.stack : 'No stack');
      throw createTempurifyError(TempurifyErrorCode.FILE_WRITE_FAILED, 'Failed to write files', { cause: error });
    }
  }

  /**
   * Updates manifest with generated files
   *
   * @param filePlans - Array of file plans
   * @throws TempurifyError if manifest update fails
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
      throw createTempurifyError(TempurifyErrorCode.MANIFEST_INVALID, 'Failed to update manifest', { cause: error });
    }
  }

  /**
   * Rolls back the last generation
   *
   * @throws TempurifyError if rollback fails
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
      throw createTempurifyError(TempurifyErrorCode.ROLLBACK_FAILED, 'Failed to rollback', { cause: error });
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
  const generator = new TempurifyGenerator(options);
  return generator.generate();
}

/**
 * Convenience function to rollback last generation
 *
 * @param rootDir - Root directory
 * @throws TempurifyError if rollback fails
 */
export async function rollback(rootDir: string): Promise<void> {
  const generator = new TempurifyGenerator({ rootDir });
  return generator.rollback();
}
