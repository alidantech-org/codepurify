import type { DiscoveredEntityFolder } from '../parser/entity-folder-parser';
import type { ParsedEntityConfig } from '../parser/config-parser';
import type { ParsedEntityType } from '../parser/entity-parser';
import { buildEntityContext, EntityContext } from './entity-context';
import { buildFieldsContext, FieldsContext } from './field-context';
import { buildRelationsContext, RelationsContext } from './relation-context';

/**
 * Complete Nest entity context for template generation
 */
export interface NestEntityContext {
  /** Entity context with names, files, exports, and metadata */
  entity: EntityContext;
  /** Fields context with groups, selection, and mutation */
  fields: FieldsContext;
  /** Relations context with groups, queries, and maps */
  relations: RelationsContext;
}

/**
 * Context builder options
 */
export interface ContextBuilderOptions {
  /** Include database field mappings */
  includeDbFields?: boolean;
  /** Include index definitions */
  includeIndexes?: boolean;
  /** Generate relation maps */
  generateRelationMaps?: boolean;
  /** Generate query types */
  generateQueryTypes?: boolean;
}

/**
 * Build complete Nest entity context from parsed entity data
 *
 * @param folder - Discovered entity folder
 * @param config - Parsed entity configuration
 * @param entityType - Parsed entity type
 * @param options - Builder options
 * @returns NestEntityContext - Complete template-ready context
 */
export function buildNestEntityContext(
  folder: DiscoveredEntityFolder,
  config: ParsedEntityConfig,
  entityType: ParsedEntityType,
  options: ContextBuilderOptions = {},
): NestEntityContext {
  const opts = {
    includeDbFields: true,
    includeIndexes: true,
    generateRelationMaps: true,
    generateQueryTypes: true,
    ...options,
  };

  // Build entity context
  const entity = buildEntityContext(folder, config, entityType);

  // Build fields context
  const fields = buildFieldsContext(entityType.fields, config);

  // Build relations context
  const relations = buildRelationsContext(entityType.relations, config, fields.groups.all, folder.entityName);

  return {
    entity,
    fields,
    relations,
  };
}

/**
 * Build context for multiple entities
 *
 * @param entities - Array of parsed entities
 * @param options - Builder options
 * @returns Record<string, NestEntityContext> - Entity contexts by name
 */
export function buildNestContexts(
  entities: Array<{
    folder: DiscoveredEntityFolder;
    config: ParsedEntityConfig;
    entityType: ParsedEntityType;
  }>,
  options: ContextBuilderOptions = {},
): Record<string, NestEntityContext> {
  const contexts: Record<string, NestEntityContext> = {};

  for (const entity of entities) {
    const context = buildNestEntityContext(entity.folder, entity.config, entity.entityType, options);
    contexts[entity.folder.entityName] = context;
  }

  return contexts;
}

/**
 * Validate context completeness
 *
 * @param context - Entity context to validate
 * @throws Error if context is incomplete
 */
export function validateEntityContext(context: NestEntityContext): void {
  const { entity, fields, relations } = context;

  // Validate entity context
  if (!entity.names.pascal || !entity.names.camel) {
    throw new Error('Entity context missing required name variants');
  }

  if (!entity.files.typesFile || !entity.files.configFile) {
    throw new Error('Entity context missing required file paths');
  }

  if (!entity.exports.interfaceName || !entity.exports.fieldsExportName) {
    throw new Error('Entity context missing required export names');
  }

  // Validate fields context
  if (!fields.groups.all || fields.groups.all.length === 0) {
    throw new Error('Fields context missing field definitions');
  }

  if (!fields.selection.selectable || !fields.mutation.creatable) {
    throw new Error('Fields context missing required field selections');
  }

  // Validate relations context
  if (!relations.maps || !relations.queries) {
    throw new Error('Relations context missing required relation data');
  }
}

/**
 * Extract context for template generation
 *
 * @param context - Complete entity context
 * @returns TemplateContext - Template-ready context
 */
export interface TemplateContext {
  /** Entity names and metadata */
  entity: EntityContext;
  /** Field definitions and groups */
  fields: FieldsContext;
  /** Relation definitions and maps */
  relations: RelationsContext;
  /** Helper functions for templates */
  helpers: {
    /** Convert string to various cases */
    toCase: (input: string, caseType: 'camel' | 'pascal' | 'kebab' | 'snake') => string;
    /** Check if field is in category */
    isFieldCategory: (fieldName: string, category: string) => boolean;
    /** Get relation by name */
    getRelation: (relationName: string) => any;
    /** Get field by name */
    getField: (fieldName: string) => any;
  };
}

/**
 * Build template context with helpers
 *
 * @param context - Entity context
 * @returns TemplateContext - Template-ready context with helpers
 */
export function buildTemplateContext(context: NestEntityContext): TemplateContext {
  const { entity, fields, relations } = context;

  return {
    entity,
    fields,
    relations,
    helpers: {
      toCase: (input: string, caseType: 'camel' | 'pascal' | 'kebab' | 'snake') => {
        switch (caseType) {
          case 'camel':
            return entity.names.camel;
          case 'pascal':
            return entity.names.pascal;
          case 'kebab':
            return entity.names.kebab;
          case 'snake':
            return entity.names.snake;
          default:
            return input;
        }
      },
      isFieldCategory: (fieldName: string, category: string) => {
        const field = fields.groups.all.find((f) => f.name === fieldName);
        return field?.category === category;
      },
      getRelation: (relationName: string) => {
        return relations.maps.entityRelations[relationName];
      },
      getField: (fieldName: string) => {
        return fields.groups.all.find((f) => f.name === fieldName);
      },
    },
  };
}

/**
 * Generate context summary for debugging
 *
 * @param context - Entity context
 * @returns string - Context summary
 */
export function summarizeContext(context: NestEntityContext): string {
  const { entity, fields, relations } = context;

  return `
Entity: ${entity.names.pascal} (${entity.entity.name})
Files: ${entity.files.typesFile}, ${entity.files.configFile}
Fields: ${fields.groups.all.length} total (${fields.groups.primitiveFields.length} primitives, ${fields.groups.relationFields.length} relations)
Relations: ${relations.groups.all.length} total (${relations.groups.oneToOne.length} one-to-one, ${relations.groups.oneToMany.length} one-to-many)
  `.trim();
}

/**
 * Context builder class for advanced usage
 */
export class NestContextBuilder {
  private options: ContextBuilderOptions;

  constructor(options: ContextBuilderOptions = {}) {
    this.options = {
      includeDbFields: true,
      includeIndexes: true,
      generateRelationMaps: true,
      generateQueryTypes: true,
      ...options,
    };
  }

  /**
   * Build context for a single entity
   */
  buildEntity(folder: DiscoveredEntityFolder, config: ParsedEntityConfig, entityType: ParsedEntityType): NestEntityContext {
    return buildNestEntityContext(folder, config, entityType, this.options);
  }

  /**
   * Build contexts for multiple entities
   */
  buildEntities(
    entities: Array<{
      folder: DiscoveredEntityFolder;
      config: ParsedEntityConfig;
      entityType: ParsedEntityType;
    }>,
  ): Record<string, NestEntityContext> {
    return buildNestContexts(entities, this.options);
  }

  /**
   * Build template context with helpers
   */
  buildTemplate(context: NestEntityContext): TemplateContext {
    return buildTemplateContext(context);
  }

  /**
   * Validate context
   */
  validate(context: NestEntityContext): void {
    validateEntityContext(context);
  }

  /**
   * Get context summary
   */
  summarize(context: NestEntityContext): string {
    return summarizeContext(context);
  }
}
