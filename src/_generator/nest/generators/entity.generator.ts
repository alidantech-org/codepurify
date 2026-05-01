/**
 * TypeORM Entity Generator
 *
 * Generates TypeORM entity files from Nest entity context.
 * Uses the TypeORM entity context builder to normalize data and
 * renders the entity template to create TypeORM entity classes.
 */

import type { GeneratedFilePlan } from '../../../types/generator.types';
import type { NestEntityContext } from '../context/nest-context-builder';
import { buildTypeOrmEntityContext } from '../context/typeorm-entity-context-builder';
import { renderNestTemplate } from '../templates/renderer';
import { join } from 'node:path';

/**
 * TypeORM entity generator options
 */
export interface TypeOrmEntityGeneratorOptions {
  /** Root directory for source files */
  rootDir: string;
  /** Configuration object */
  config: any;
  /** Whether to use debug logging */
  debug?: boolean;
}

/**
 * Generates TypeORM entity file from Nest entity context
 *
 * @param entityContext - Nest entity context
 * @param options - Generator options
 * @returns Generated file plan
 */
export async function generateTypeOrmEntity(
  entityContext: NestEntityContext,
  options: TypeOrmEntityGeneratorOptions,
): Promise<GeneratedFilePlan> {
  const { rootDir, config, debug = false } = options;

  try {
    // Build TypeORM entity template context
    const typeOrmContext = buildTypeOrmEntityContext(entityContext);

    if (debug) {
      console.log('DEBUG: TypeORM entity context built:', {
        entity: typeOrmContext.entity.names.pascal,
        module: typeOrmContext.entity.module.name,
        columnGroups: typeOrmContext.columns.groups.map((g: any) => ({ key: g.key, count: g.items.length })),
        relationGroups: typeOrmContext.typeormRelations.groups.map((g: any) => ({ key: g.key, count: g.items.length })),
        indexes: typeOrmContext.indexes.length,
        hasEnums: !!typeOrmContext.imports.enums,
        relationImports: typeOrmContext.imports.relations.length,
      });
    }

    // Debug: Log the context structure before rendering
    if (debug) {
      console.log('DEBUG: Template context keys:', Object.keys(typeOrmContext));
      console.log('DEBUG: Template context imports:', typeOrmContext.imports);
      console.log('DEBUG: Template context entity:', typeOrmContext.entity);
      console.log('DEBUG: Entity names:', typeOrmContext.entity?.names);
      console.log('DEBUG: Entity module:', typeOrmContext.entity?.entity?.module);
      console.log('DEBUG: Full context:', JSON.stringify(typeOrmContext, null, 2));
    }

    // Render entity template - pass the TypeORM context as the template data
    const renderResult = await renderNestTemplate('entity', typeOrmContext, config, rootDir);

    // Build output file path
    const outputPath = buildEntityOutputPath(entityContext, rootDir);

    // Create file plan
    const filePlan: GeneratedFilePlan = {
      kind: 'entity',
      filePath: outputPath,
      content: renderResult.content,
      source: 'entity.generator.ts',
      template: renderResult.templatePath,
      immutable: true,
      generator: 'nest:typeorm-entity',
    };

    return filePlan;
  } catch (error) {
    throw new Error(
      `Failed to generate TypeORM entity for ${entityContext.entity.names.pascal}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Builds output file path for entity
 *
 * @param entityContext - Entity context
 * @param rootDir - Root directory
 * @returns Output file path
 */
function buildEntityOutputPath(entityContext: NestEntityContext, rootDir: string): string {
  const { entity } = entityContext;

  // Build path: modules/{module}/schema/{entity}.entity.ts
  const modulePath = join('modules', entity.entity.module, 'schema');
  const fileName = `${entity.names.kebab}.entity.ts`;

  return join(rootDir, modulePath, fileName);
}

/**
 * Validates TypeORM entity generation requirements
 *
 * @param entityContext - Entity context
 * @throws Error if requirements are not met
 */
export function validateTypeOrmEntityGeneration(entityContext: NestEntityContext): void {
  const { entity, fields } = entityContext;

  // Validate entity context
  if (!entity.names.pascal || !entity.names.camel) {
    throw new Error('Entity context missing required name variants');
  }

  if (!entity.entity.module) {
    throw new Error('Entity context missing module information');
  }

  if (!entity.exports.interfaceName) {
    throw new Error('Entity context missing interface name');
  }

  // Validate fields context
  if (!fields.groups.all || fields.groups.all.length === 0) {
    throw new Error('Fields context missing field definitions');
  }

  // Validate required field properties
  fields.groups.all.forEach((field, index) => {
    if (!field.name) {
      throw new Error(`Field at index ${index} missing name`);
    }
    if (!field.type) {
      throw new Error(`Field '${field.name}' missing type`);
    }
    if (!field.columnName) {
      throw new Error(`Field '${field.name}' missing column name`);
    }
    if (!field.category) {
      throw new Error(`Field '${field.name}' missing category`);
    }
  });
}
