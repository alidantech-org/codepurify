/**
 * Template variable validation
 */

/**
 * Variable validation result
 */
export interface VariableValidationResult {
  /** Validation passed */
  valid: boolean;
  /** Missing required variables */
  missing: string[];
  /** Invalid variable types */
  invalid: Array<{
    name: string;
    expected: string;
    actual: string;
  }>;
  /** Warnings */
  warnings: string[];
}

/**
 * Variable definition
 */
export interface VariableDefinition {
  /** Variable name */
  name: string;
  /** Expected type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  /** Is variable required */
  required: boolean;
  /** Variable description */
  description: string;
  /** Validation function */
  validate?: (value: any) => boolean | string;
}

/**
 * Template variable validator
 */
export class VariableValidator {
  private definitions: Map<string, VariableDefinition[]> = new Map();

  /**
   * Register variable definitions for a template
   *
   * @param templateName - Template name
   * @param definitions - Variable definitions
   */
  register(templateName: string, definitions: VariableDefinition[]): void {
    this.definitions.set(templateName, definitions);
  }

  /**
   * Validate template context
   *
   * @param templateName - Template name
   * @param context - Template context
   * @returns VariableValidationResult - Validation result
   */
  validate(templateName: string, context: any): VariableValidationResult {
    const definitions = this.definitions.get(templateName);
    if (!definitions) {
      return {
        valid: true,
        missing: [],
        invalid: [],
        warnings: [`No variable definitions found for template '${templateName}'`],
      };
    }

    const result: VariableValidationResult = {
      valid: true,
      missing: [],
      invalid: [],
      warnings: [],
    };

    for (const definition of definitions) {
      const value = this.getVariableValue(context, definition.name);

      // Check required variables
      if (definition.required && (value === undefined || value === null)) {
        result.missing.push(definition.name);
        result.valid = false;
        continue;
      }

      // Skip validation for optional variables that are not present
      if (!definition.required && (value === undefined || value === null)) {
        continue;
      }

      // Validate type
      const typeValidation = this.validateType(value, definition);
      if (!typeValidation.valid) {
        result.invalid.push({
          name: definition.name,
          expected: definition.type,
          actual: typeValidation.actual,
        });
        result.valid = false;
        continue;
      }

      // Custom validation
      if (definition.validate) {
        const customResult = definition.validate(value);
        if (typeof customResult === 'string') {
          result.warnings.push(`${definition.name}: ${customResult}`);
        } else if (!customResult) {
          result.warnings.push(`${definition.name}: Custom validation failed`);
        }
      }
    }

    return result;
  }

  /**
   * Get variable value from context (supports dot notation)
   *
   * @param context - Template context
   * @param variablePath - Variable path
   * @returns any - Variable value
   */
  private getVariableValue(context: any, variablePath: string): any {
    const parts = variablePath.split('.');
    let current = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Validate variable type
   *
   * @param value - Variable value
   * @param definition - Variable definition
   * @returns object - Type validation result
   */
  private validateType(value: any, definition: VariableDefinition): { valid: boolean; actual: string } {
    const actualType = this.getTypeOf(value);

    if (actualType === definition.type) {
      return { valid: true, actual: actualType };
    }

    // Allow some type flexibility
    if (definition.type === 'array' && Array.isArray(value)) {
      return { valid: true, actual: 'array' };
    }

    if (definition.type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return { valid: true, actual: 'object' };
    }

    return { valid: false, actual: actualType };
  }

  /**
   * Get type of value
   *
   * @param value - Value to check
   * @returns string - Type name
   */
  private getTypeOf(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'function') return 'function';
    return typeof value;
  }

  /**
   * Get variable definitions for template
   *
   * @param templateName - Template name
   * @returns VariableDefinition[] - Variable definitions
   */
  getDefinitions(templateName: string): VariableDefinition[] {
    return this.definitions.get(templateName) || [];
  }

  /**
   * List all registered templates
   *
   * @returns string[] - Template names
   */
  listTemplates(): string[] {
    return Array.from(this.definitions.keys());
  }
}

/**
 * Default variable validator with built-in template definitions
 */
export const defaultValidator = new VariableValidator();

/**
 * Register built-in variable definitions
 */
function registerBuiltInDefinitions(): void {
  // Context template variables
  defaultValidator.register('context', [
    { name: 'entity', type: 'object', required: true, description: 'Entity context with names and metadata' },
    { name: 'fields', type: 'object', required: true, description: 'Fields context with groups and selections' },
    { name: 'relations', type: 'object', required: true, description: 'Relations context with groups and maps' },
    { name: 'entity.names.pascal', type: 'string', required: true, description: 'Pascal case entity name' },
    { name: 'entity.names.camel', type: 'string', required: true, description: 'Camel case entity name' },
    { name: 'entity.files.contextFile', type: 'string', required: true, description: 'Context file path' },
    { name: 'entity.exports.interfaceName', type: 'string', required: true, description: 'Interface name' },
    { name: 'entity.names.kebab', type: 'string', required: false, description: 'Kebab case entity name' },
    { name: 'entity.names.snake', type: 'string', required: false, description: 'Snake case entity name' },
    { name: 'entity.names.plural', type: 'string', required: false, description: 'Plural entity name' },
    { name: 'entity.names.singular', type: 'string', required: false, description: 'Singular entity name' },
    { name: 'fields.groups', type: 'object', required: false, description: 'Field groups' },
    { name: 'fields.selection', type: 'object', required: false, description: 'Field selection context' },
    { name: 'fields.mutation', type: 'object', required: false, description: 'Field mutation context' },
    { name: 'relations.groups', type: 'object', required: false, description: 'Relation groups' },
    { name: 'relations.queries', type: 'object', required: false, description: 'Relation query context' },
    { name: 'relations.maps', type: 'object', required: false, description: 'Relation maps' },
  ]);

  // Index template variables
  defaultValidator.register('index', [
    { name: 'entity.names.pascal', type: 'string', required: true, description: 'Pascal case entity name' },
    { name: 'entity.names.camel', type: 'string', required: true, description: 'Camel case entity name' },
    { name: 'entity.files.indexFile', type: 'string', required: true, description: 'Index file path' },
    { name: 'entity.names.kebab', type: 'string', required: false, description: 'Kebab case entity name' },
    { name: 'entity.names.snake', type: 'string', required: false, description: 'Snake case entity name' },
    { name: 'entity.names.plural', type: 'string', required: false, description: 'Plural entity name' },
    { name: 'entity.names.singular', type: 'string', required: false, description: 'Singular entity name' },
    { name: 'hasContext', type: 'boolean', required: false, description: 'Has context file' },
    { name: 'hasController', type: 'boolean', required: false, description: 'Has controller file' },
    { name: 'hasService', type: 'boolean', required: false, description: 'Has service file' },
    { name: 'hasModule', type: 'boolean', required: false, description: 'Has module file' },
    { name: 'hasDto', type: 'boolean', required: false, description: 'Has DTO files' },
  ]);

  // Controller template variables
  defaultValidator.register('controller', [
    { name: 'entity', type: 'object', required: true, description: 'Entity context' },
    { name: 'fields', type: 'object', required: true, description: 'Fields context' },
    { name: 'relations', type: 'object', required: true, description: 'Relations context' },
    { name: 'entity.names.pascal', type: 'string', required: true, description: 'Pascal case entity name' },
    { name: 'entity.names.camel', type: 'string', required: true, description: 'Camel case entity name' },
    { name: 'entity.names.kebab', type: 'string', required: true, description: 'Kebab case entity name' },
    { name: 'entity.files.controllerFile', type: 'string', required: true, description: 'Controller file path' },
    { name: 'entity.route', type: 'string', required: true, description: 'Entity route' },
    { name: 'entity.names.snake', type: 'string', required: false, description: 'Snake case entity name' },
    { name: 'entity.names.plural', type: 'string', required: false, description: 'Plural entity name' },
    { name: 'entity.names.singular', type: 'string', required: false, description: 'Singular entity name' },
    { name: 'fields.selection.sortable', type: 'array', required: false, description: 'Sortable fields' },
    { name: 'fields.selection.filterable', type: 'array', required: false, description: 'Filterable fields' },
    { name: 'relations.groups.oneToMany', type: 'array', required: false, description: 'One-to-many relations' },
    { name: 'relations.groups.manyToOne', type: 'array', required: false, description: 'Many-to-one relations' },
    { name: 'relations.groups.manyToMany', type: 'array', required: false, description: 'Many-to-many relations' },
  ]);

  // Service template variables
  defaultValidator.register('service', [
    { name: 'entity', type: 'object', required: true, description: 'Entity context' },
    { name: 'fields', type: 'object', required: true, description: 'Fields context' },
    { name: 'relations', type: 'object', required: true, description: 'Relations context' },
    { name: 'entity.names.pascal', type: 'string', required: true, description: 'Pascal case entity name' },
    { name: 'entity.names.camel', type: 'string', required: true, description: 'Camel case entity name' },
    { name: 'entity.files.serviceFile', type: 'string', required: true, description: 'Service file path' },
    { name: 'entity.exports.interfaceName', type: 'string', required: true, description: 'Interface name' },
    { name: 'entity.names.kebab', type: 'string', required: false, description: 'Kebab case entity name' },
    { name: 'entity.names.snake', type: 'string', required: false, description: 'Snake case entity name' },
    { name: 'entity.names.plural', type: 'string', required: false, description: 'Plural entity name' },
    { name: 'entity.names.singular', type: 'string', required: false, description: 'Singular entity name' },
    { name: 'fields.groups.primaryKeys', type: 'array', required: false, description: 'Primary key fields' },
    { name: 'fields.groups.foreignKeys', type: 'array', required: false, description: 'Foreign key fields' },
    { name: 'relations.maps.entityRelations', type: 'object', required: false, description: 'Entity relations map' },
  ]);

  // Module template variables
  defaultValidator.register('module', [
    { name: 'entity.names.pascal', type: 'string', required: true, description: 'Pascal case entity name' },
    { name: 'entity.names.camel', type: 'string', required: true, description: 'Camel case entity name' },
    { name: 'entity.files.moduleFile', type: 'string', required: true, description: 'Module file path' },
    { name: 'entity.names.kebab', type: 'string', required: false, description: 'Kebab case entity name' },
    { name: 'entity.names.snake', type: 'string', required: false, description: 'Snake case entity name' },
    { name: 'entity.names.plural', type: 'string', required: false, description: 'Plural entity name' },
    { name: 'entity.names.singular', type: 'string', required: false, description: 'Singular entity name' },
    { name: 'hasController', type: 'boolean', required: false, description: 'Has controller file' },
    { name: 'hasService', type: 'boolean', required: false, description: 'Has service file' },
    { name: 'hasRepository', type: 'boolean', required: false, description: 'Has repository file' },
    { name: 'imports', type: 'array', required: false, description: 'Module imports' },
    { name: 'providers', type: 'array', required: false, description: 'Module providers' },
    { name: 'exports', type: 'array', required: false, description: 'Module exports' },
  ]);

  // Entity template variables
  defaultValidator.register('entity', [
    { name: 'entity', type: 'object', required: true, description: 'Entity context' },
    { name: 'fields', type: 'object', required: true, description: 'Fields context' },
    { name: 'relations', type: 'object', required: true, description: 'Relations context' },
    { name: 'entity.names.pascal', type: 'string', required: true, description: 'Pascal case entity name' },
    { name: 'entity.names.camel', type: 'string', required: true, description: 'Camel case entity name' },
    { name: 'entity.files.entityFile', type: 'string', required: true, description: 'Entity file path' },
    { name: 'entity.meta.tableName', type: 'string', required: true, description: 'Database table name' },
    { name: 'entity.meta.schema', type: 'string', required: true, description: 'Database schema name' },
    { name: 'entity.names.snake', type: 'string', required: false, description: 'Snake case entity name' },
    { name: 'entity.names.plural', type: 'string', required: false, description: 'Plural entity name' },
    { name: 'entity.names.singular', type: 'string', required: false, description: 'Singular entity name' },
    { name: 'fields.groups.all', type: 'array', required: false, description: 'All fields' },
    { name: 'relations.groups.all', type: 'array', required: false, description: 'All relations' },
    { name: 'entity.options.timestamps', type: 'boolean', required: false, description: 'Enable timestamps' },
    { name: 'entity.options.softDelete', type: 'boolean', required: false, description: 'Enable soft delete' },
  ]);
}

// Register built-in definitions
registerBuiltInDefinitions();

/**
 * Validate template variables
 *
 * @param templateName - Template name
 * @param context - Template context
 * @param validator - Variable validator (optional)
 * @returns VariableValidationResult - Validation result
 */
export function validateTemplateVariables(
  templateName: string,
  context: any,
  validator: VariableValidator = defaultValidator,
): VariableValidationResult {
  return validator.validate(templateName, context);
}

/**
 * Create custom variable validator
 *
 * @returns VariableValidator - New validator instance
 */
export function createVariableValidator(): VariableValidator {
  return new VariableValidator();
}
