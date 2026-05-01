/**
 * Tempurify Template Variables
 * 
 * This file defines the standard template variables available to all Tempurify templates.
 * These variables are provided as top-level variables in the template context and can be
 * used directly in Eta templates without any prefix.
 * 
 * Example usage in templates:
 * ```eta
 * <%= entity.names.pascal %>
 * <%= fields.groups.all.length %>
 * <%= relations.hasMany.length %>
 * <%= basename(entity.files.typesFile) %>
 * ```
 */

/**
 * Required template variables that must be present for all templates
 * These are validated before template rendering to ensure compatibility
 */
export const REQUIRED_TEMPLATE_VARIABLES = [
  'entity',
  'fields', 
  'relations'
] as const;

/**
 * All available template variables with their descriptions
 */
export const TEMPLATE_VARIABLES = {
  /**
   * Entity metadata and information
   * 
   * Contains:
   * - names: Object with different name formats (pascal, camel, kebab, snake)
   * - files: Object with file paths (typesFile, contextFile, indexFile, etc.)
   * - exports: Object with export names (interfaceName, contextName, etc.)
   * - config: Entity configuration from .config.ts file
   * - folder: Discovered entity folder information
   */
  entity: {
    description: 'Entity metadata including names, files, exports, and configuration',
    usage: [
      'entity.names.pascal - PascalCase entity name (e.g., "UserEntity")',
      'entity.names.camel - camelCase entity name (e.g., "userEntity")', 
      'entity.names.kebab - kebab-case entity name (e.g., "user-entity")',
      'entity.names.snake - snake_case entity name (e.g., "user_entity")',
      'entity.files.typesFile - Path to the entity types file',
      'entity.files.contextFile - Path to the entity context file',
      'entity.files.indexFile - Path to the entity index file',
      'entity.exports.interfaceName - Name of the main interface export',
      'entity.exports.contextName - Name of the context export',
      'entity.config - Raw entity configuration object',
      'entity.folder.entityName - Name of the entity folder',
      'entity.folder.folderPath - Full path to the entity folder'
    ]
  },

  /**
   * Field definitions and groupings
   * 
   * Contains:
   * - groups: Object with different field groupings (all, filterable, creatable, updatable)
   * - selection: Object with field selections for different operations
   * - metadata: Field metadata and type information
   */
  fields: {
    description: 'Field definitions organized by purpose and operation',
    usage: [
      'fields.groups.all - Array of all entity fields',
      'fields.groups.filterable - Array of fields that can be used for filtering',
      'fields.groups.creatable - Array of fields that can be created',
      'fields.groups.updatable - Array of fields that can be updated',
      'fields.selection.filterable - Selection object for filterable fields',
      'fields.selection.creatable - Selection object for creatable fields',
      'fields.selection.updatable - Selection object for updatable fields',
      'fields.metadata - Object containing field metadata and types'
    ]
  },

  /**
   * Relationship definitions and groupings
   * 
   * Contains:
   * - groups: Object with relationship groupings (all, hasMany, hasOne, belongsTo)
   * - metadata: Relationship metadata and target information
   */
  relations: {
    description: 'Relationship definitions organized by type',
    usage: [
      'relations.groups.all - Array of all entity relationships',
      'relations.groups.hasMany - Array of has-many relationships',
      'relations.groups.hasOne - Array of has-one relationships', 
      'relations.groups.belongsTo - Array of belongs-to relationships',
      'relations.metadata - Object containing relationship metadata'
    ]
  },

  /**
   * Utility function for extracting file names from paths
   * 
   * Function signature: (path: string) => string
   * 
   * Used to get the base name of a file without directory path
   */
  basename: {
    description: 'Utility function to extract base filename from path',
    usage: [
      'basename(entity.files.typesFile) - Get filename without path (e.g., "user.types.ts")',
      'basename("/path/to/file.txt") - Returns "file.txt"',
      'basename("C:\\folder\\subfolder\\file.js") - Returns "file.js"'
    ]
  }
} as const;

/**
 * Template variable validation rules
 */
export const TEMPLATE_VALIDATION = {
  /**
   * Variables that must be present for template rendering
   */
  required: REQUIRED_TEMPLATE_VARIABLES,
  
  /**
   * Variables that are optional but commonly used
   */
  optional: [
    'basename'
  ] as const,
  
  /**
   * Variables that should be functions
   */
  functions: [
    'basename'
  ] as const,
  
  /**
   * Variables that should be objects
   */
  objects: [
    'entity',
    'fields',
    'relations'
  ] as const
} as const;

/**
 * Get human-readable documentation for a template variable
 */
export function getVariableDocumentation(variableName: keyof typeof TEMPLATE_VARIABLES): string {
  const variable = TEMPLATE_VARIABLES[variableName];
  if (!variable) {
    return `Unknown template variable: ${variableName}`;
  }
  
  return [
    `**${variableName}**`,
    `${variable.description}`,
    '',
    'Usage:',
    ...variable.usage.map(usage => `- ${usage}`)
  ].join('\n');
}

/**
 * Get all template variable names
 */
export function getAllTemplateVariables(): string[] {
  return Object.keys(TEMPLATE_VARIABLES);
}

/**
 * Check if a template variable is required
 */
export function isRequiredVariable(variableName: string): boolean {
  return REQUIRED_TEMPLATE_VARIABLES.includes(variableName as typeof REQUIRED_TEMPLATE_VARIABLES[number]);
}

/**
 * Get template variable type information
 */
export function getVariableType(variableName: string): 'object' | 'function' | 'unknown' {
  if (TEMPLATE_VALIDATION.functions.includes(variableName as typeof TEMPLATE_VALIDATION.functions[number])) {
    return 'function';
  }
  if (TEMPLATE_VALIDATION.objects.includes(variableName as typeof TEMPLATE_VALIDATION.objects[number])) {
    return 'object';
  }
  return 'unknown';
}
