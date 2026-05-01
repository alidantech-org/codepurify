import { join } from 'node:path';

/**
 * Template definition
 */
export interface TemplateDefinition {
  /** Template identifier */
  name: string;
  /** Template file path */
  path: string;
  /** Template description */
  description: string;
  /** Required context variables */
  requiredVariables: string[];
  /** Optional context variables */
  optionalVariables: string[];
  /** Template category */
  category: 'entity' | 'context' | 'controller' | 'service' | 'module' | 'dto' | 'index';
}

/**
 * Template registry
 */
export class TemplateRegistry {
  private templates: Map<string, TemplateDefinition> = new Map();
  private baseTemplateDir: string;

  constructor(baseTemplateDir: string = 'templates') {
    this.baseTemplateDir = baseTemplateDir;
    this.registerBuiltInTemplates();
  }

  /**
   * Register a template
   *
   * @param template - Template definition
   */
  register(template: TemplateDefinition): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get template definition
   *
   * @param name - Template name
   * @returns TemplateDefinition | undefined - Template definition
   */
  get(name: string): TemplateDefinition | undefined {
    return this.templates.get(name);
  }

  /**
   * Get template path
   *
   * @param name - Template name
   * @returns string | undefined - Template path
   */
  getPath(name: string): string | undefined {
    const template = this.templates.get(name);
    return template ? this.getFullPath(template.path) : undefined;
  }

  /**
   * Check if template exists
   *
   * @param name - Template name
   * @returns boolean - True if template exists
   */
  has(name: string): boolean {
    return this.templates.has(name);
  }

  /**
   * Get all templates
   *
   * @returns TemplateDefinition[] - All registered templates
   */
  getAll(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   *
   * @param category - Template category
   * @returns TemplateDefinition[] - Templates in category
   */
  getByCategory(category: TemplateDefinition['category']): TemplateDefinition[] {
    return this.getAll().filter((template) => template.category === category);
  }

  /**
   * Get full template path
   *
   * @param templatePath - Relative template path
   * @returns string - Full template path
   */
  private getFullPath(templatePath: string): string {
    return join(this.baseTemplateDir, templatePath);
  }

  /**
   * Register built-in templates
   */
  private registerBuiltInTemplates(): void {
    // Context template
    this.register({
      name: 'context',
      path: 'nest/context.ts.eta',
      description: 'NestJS entity context file with field definitions, relations, and query types',
      requiredVariables: [
        'entity',
        'fields',
        'relations',
        'entity.names.pascal',
        'entity.names.camel',
        'entity.files.contextFile',
        'entity.exports.interfaceName',
      ],
      optionalVariables: [
        'entity.names.kebab',
        'entity.names.snake',
        'entity.names.plural',
        'entity.names.singular',
        'fields.groups',
        'fields.selection',
        'fields.mutation',
        'relations.groups',
        'relations.queries',
        'relations.maps',
      ],
      category: 'context',
    });

    // Index template
    this.register({
      name: 'index',
      path: 'nest/index.ts.eta',
      description: 'NestJS entity index file exporting all generated components',
      requiredVariables: ['entity.names.pascal', 'entity.names.camel', 'entity.files.indexFile'],
      optionalVariables: [
        'entity.names.kebab',
        'entity.names.snake',
        'entity.names.plural',
        'entity.names.singular',
        'hasContext',
        'hasController',
        'hasService',
        'hasModule',
        'hasDto',
      ],
      category: 'index',
    });

    // Controller template
    this.register({
      name: 'controller',
      path: 'nest/controller.ts.eta',
      description: 'NestJS REST controller with CRUD operations',
      requiredVariables: [
        'entity',
        'fields',
        'relations',
        'entity.names.pascal',
        'entity.names.camel',
        'entity.names.kebab',
        'entity.files.controllerFile',
        'entity.route',
      ],
      optionalVariables: [
        'entity.names.snake',
        'entity.names.plural',
        'entity.names.singular',
        'fields.selection.sortable',
        'fields.selection.filterable',
        'relations.groups.oneToMany',
        'relations.groups.manyToOne',
        'relations.groups.manyToMany',
      ],
      category: 'controller',
    });

    // Service template
    this.register({
      name: 'service',
      path: 'nest/service.ts.eta',
      description: 'NestJS service with business logic and data access',
      requiredVariables: [
        'entity',
        'fields',
        'relations',
        'entity.names.pascal',
        'entity.names.camel',
        'entity.files.serviceFile',
        'entity.exports.interfaceName',
      ],
      optionalVariables: [
        'entity.names.kebab',
        'entity.names.snake',
        'entity.names.plural',
        'entity.names.singular',
        'fields.groups.primaryKeys',
        'fields.groups.foreignKeys',
        'relations.maps.entityRelations',
      ],
      category: 'service',
    });

    // Module template
    this.register({
      name: 'module',
      path: 'nest/module.ts.eta',
      description: 'NestJS module organizing controllers, services, and dependencies',
      requiredVariables: ['entity.names.pascal', 'entity.names.camel', 'entity.files.moduleFile'],
      optionalVariables: [
        'entity.names.kebab',
        'entity.names.snake',
        'entity.names.plural',
        'entity.names.singular',
        'hasController',
        'hasService',
        'hasRepository',
        'imports',
        'providers',
        'exports',
      ],
      category: 'module',
    });

    // DTO templates
    this.register({
      name: 'create-dto',
      path: 'nest/dto/create.dto.ts.eta',
      description: 'DTO for entity creation with validation rules',
      requiredVariables: ['entity.names.pascal', 'entity.files.createDtoFile', 'fields.mutation.creatable'],
      optionalVariables: ['entity.names.camel', 'entity.names.kebab', 'fields.groups.primitiveFields', 'fields.groups.relationFields'],
      category: 'dto',
    });

    this.register({
      name: 'update-dto',
      path: 'nest/dto/update.dto.ts.eta',
      description: 'DTO for entity updates with partial validation',
      requiredVariables: ['entity.names.pascal', 'entity.files.updateDtoFile', 'fields.mutation.updatable'],
      optionalVariables: ['entity.names.camel', 'entity.names.kebab', 'fields.groups.primitiveFields', 'fields.groups.relationFields'],
      category: 'dto',
    });

    this.register({
      name: 'query-dto',
      path: 'nest/dto/query.dto.ts.eta',
      description: 'DTO for query parameters with filtering and pagination',
      requiredVariables: ['entity.names.pascal', 'entity.files.queryDtoFile', 'fields.selection.filterable', 'fields.selection.sortable'],
      optionalVariables: [
        'entity.names.camel',
        'entity.names.kebab',
        'fields.selection.searchable',
        'fields.selection.dateRange',
        'relations.groups.all',
      ],
      category: 'dto',
    });

    // Entity template
    this.register({
      name: 'entity',
      path: 'nest/entity.ts.eta',
      description: 'TypeORM entity class with decorators and relationships',
      requiredVariables: [
        'entity',
        'fields',
        'relations',
        'entity.names.pascal',
        'entity.names.camel',
        'entity.files.entityFile',
        'entity.meta.tableName',
        'entity.meta.schema',
      ],
      optionalVariables: [
        'entity.names.snake',
        'entity.names.plural',
        'entity.names.singular',
        'fields.groups.all',
        'relations.groups.all',
        'entity.options.timestamps',
        'entity.options.softDelete',
      ],
      category: 'entity',
    });
  }

  /**
   * Validate template context
   *
   * @param name - Template name
   * @param context - Template context
   * @throws Error if required variables are missing
   */
  validateContext(name: string, context: any): void {
    const template = this.get(name);
    if (!template) {
      throw new Error(`Template '${name}' not found in registry`);
    }

    const missing = template.requiredVariables.filter((variable) => {
      return !this.hasVariable(context, variable);
    });

    if (missing.length > 0) {
      throw new Error(`Template '${name}' missing required variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Check if variable exists in context (supports dot notation)
   *
   * @param context - Template context
   * @param variablePath - Variable path (e.g., 'entity.names.pascal')
   * @returns boolean - True if variable exists
   */
  private hasVariable(context: any, variablePath: string): boolean {
    const parts = variablePath.split('.');
    let current = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return false;
      }
      current = current[part];
    }

    return current !== undefined;
  }

  /**
   * Get template requirements
   *
   * @param name - Template name
   * @returns TemplateDefinition | undefined - Template requirements
   */
  getRequirements(name: string): TemplateDefinition | undefined {
    return this.get(name);
  }

  /**
   * List available templates
   *
   * @returns string[] - Template names
   */
  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Get template statistics
   *
   * @returns object - Template statistics
   */
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    categories: string[];
  } {
    const templates = this.getAll();
    const byCategory: Record<string, number> = {};
    const categories = new Set<string>();

    for (const template of templates) {
      categories.add(template.category);
      byCategory[template.category] = (byCategory[template.category] || 0) + 1;
    }

    return {
      total: templates.length,
      byCategory,
      categories: Array.from(categories),
    };
  }
}

/**
 * Default template registry instance
 */
export const defaultRegistry = new TemplateRegistry();

/**
 * Get template registry
 *
 * @param baseDir - Base template directory
 * @returns TemplateRegistry - Template registry
 */
export function getTemplateRegistry(baseDir?: string): TemplateRegistry {
  return baseDir ? new TemplateRegistry(baseDir) : defaultRegistry;
}
