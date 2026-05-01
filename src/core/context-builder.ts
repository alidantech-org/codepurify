/**
 * Tempura Context Builder
 *
 * Orchestrates the generation of entity contexts using the new 3-layer architecture.
 * Manages parsing, generation, and validation of entity contexts.
 */

import { createTempuraError, TempuraErrorCode } from './errors';
import { logger } from './logger';
import type { ParsedEntityDefinition } from '../types/entity.definition';
import type { ContextGenerationOptions, ContextGenerationResult } from '../types/context.definition';

/**
 * Context builder options
 */
export interface ContextBuilderOptions extends ContextGenerationOptions {
  /** Pattern for finding entity folders */
  entityPattern?: string;
}

/**
 * Context builder result
 */
export interface ContextBuilderResult {
  /** Generation results for each entity */
  results: ContextGenerationResult[];
  /** Number of entities processed */
  entitiesProcessed: number;
  /** Total number of types generated */
  totalTypesGenerated: number;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Builds entity contexts using the new 3-layer architecture
 */
export class ContextBuilder {
  constructor(private options: ContextBuilderOptions) {}

  /**
   * Builds contexts for all entities in the project
   *
   * @returns Context builder result
   * @throws TempuraError if building fails
   */
  async buildContexts(): Promise<ContextBuilderResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting context build process');

      // Parse entity folders
      const entities = await this.parseEntityFolders();

      if (entities.length === 0) {
        logger.warn('No entity folders found');
        return {
          results: [],
          entitiesProcessed: 0,
          totalTypesGenerated: 0,
          processingTimeMs: Date.now() - startTime,
        };
      }

      // Generate contexts for each entity
      const results: ContextGenerationResult[] = [];
      let totalTypesGenerated = 0;

      for (const entity of entities) {
        try {
          const result = await this.generateContextForEntity(entity);
          results.push(result);
          totalTypesGenerated += result.generatedTypes;
        } catch (error) {
          logger.error(`Failed to generate context for entity: ${entity.entityName}`, error);
          // Continue with other entities
        }
      }

      const processingTime = Date.now() - startTime;

      logger.info(
        `Context build completed: ${results.length}/${entities.length} entities processed, ${totalTypesGenerated} types generated in ${processingTime}ms`,
      );

      return {
        results,
        entitiesProcessed: results.length,
        totalTypesGenerated,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.GENERATION_FAILED, 'Failed to build contexts', { cause: error });
    }
  }

  /**
   * Builds context for a single entity
   *
   * @param entityName - Entity name
   * @returns Generation result
   * @throws TempuraError if building fails
   */
  async buildContextForEntity(entityName: string): Promise<ContextGenerationResult> {
    try {
      logger.info(`Building context for entity: ${entityName}`);

      // Parse specific entity folder
      const entity = await this.parseSingleEntity(entityName);

      // Generate context
      const result = await this.generateContextForEntity(entity);

      logger.info(`Context built for entity: ${entityName}`);
      return result;
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.GENERATION_FAILED, `Failed to build context for entity: ${entityName}`, {
        entityName,
        cause: error,
      });
    }
  }

  /**
   * Validates existing contexts for all entities
   *
   * @returns Validation result
   * @throws TempuraError if validation fails
   */
  async validateContexts(): Promise<{
    valid: number;
    invalid: number;
    errors: Array<{ entity: string; error: string }>;
  }> {
    try {
      logger.info('Starting context validation');

      // Parse entity folders
      const entities = await this.parseEntityFolders();

      let valid = 0;
      let invalid = 0;
      const errors: Array<{ entity: string; error: string }> = [];

      for (const entity of entities) {
        try {
          await this.validateEntityContext(entity);
          valid++;
        } catch (error) {
          invalid++;
          errors.push({
            entity: entity.entityName,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      logger.info(`Context validation completed: ${valid} valid, ${invalid} invalid`);

      return { valid, invalid, errors };
    } catch (error) {
      throw createTempuraError(TempuraErrorCode.VALIDATION_FAILED, 'Failed to validate contexts', { cause: error });
    }
  }

  /**
   * Parses entity folders
   *
   * @returns Array of parsed entity definitions
   */
  private async parseEntityFolders(): Promise<ParsedEntityDefinition[]> {
    const { EntityFolderParser } = await import('../_generator/nest/parser/entity-folder-parser');

    const parser = new EntityFolderParser({
      rootDir: this.options.rootDir,
      pattern: this.options.entityPattern,
    });

    const result = await parser.parseEntityFolders();
    return result.entities;
  }

  /**
   * Parses a single entity folder
   *
   * @param entityName - Entity name
   * @returns Parsed entity definition
   */
  private async parseSingleEntity(entityName: string): Promise<ParsedEntityDefinition> {
    const { EntityFolderParser } = await import('../_generator/nest/parser/entity-folder-parser');

    const parser = new EntityFolderParser({
      rootDir: this.options.rootDir,
    });

    // Find the specific entity folder
    const parseResult = await parser.parseEntityFolders();
    const entity = parseResult.entities.find((e: ParsedEntityDefinition) => e.entityName === entityName);

    if (!entity) {
      throw createTempuraError(TempuraErrorCode.FILE_NOT_FOUND, `Entity folder not found: ${entityName}`);
    }

    return entity;
  }

  /**
   * Generates context for a single entity
   *
   * @param entity - Parsed entity definition
   * @returns Generation result
   */
  private async generateContextForEntity(entity: ParsedEntityDefinition): Promise<ContextGenerationResult> {
    const { ContextGenerator } = await import('../_generator/nest/generators/context.generator');

    const generator = new ContextGenerator({
      rootDir: this.options.rootDir,
      templateDir: this.options.templateDir,
      overwrite: this.options.overwrite,
    });

    return await generator.generateContext(entity);
  }

  /**
   * Validates generated context for an entity
   *
   * @param entity - Parsed entity definition
   */
  private async validateEntityContext(entity: ParsedEntityDefinition): Promise<void> {
    const { EntityFolderParser } = await import('../_generator/nest/parser/entity-folder-parser');

    const parser = new EntityFolderParser({
      rootDir: this.options.rootDir,
    });

    await parser.validateGeneratedFiles(entity);
  }
}
