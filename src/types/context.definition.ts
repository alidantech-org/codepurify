/**
 * Tempurify Context Definition Types
 *
 * Defines the structure for entity context generation.
 * Provides types for context creation and template generation.
 */

/**
 * Entity context definition for generation
 */
export type EntityContextDefinition = {
  /** Source file information */
  source: {
    /** Types file path */
    typesFile: string;
    /** Config file path */
    configFile: string;
  };

  /** Generated file information */
  generated: {
    /** Context file path */
    contextFile: string;
  };

  /** Entity metadata */
  entity: {
    /** Entity name */
    name: string;
    /** Module name */
    module: string;
    /** API route */
    route: string;
    /** Table name */
    tableName: string;
    /** Entity class name */
    entityClass: string;
  };
};

/**
 * Context generation options
 */
export type ContextGenerationOptions = {
  /** Root directory */
  rootDir: string;
  /** Whether to overwrite existing context */
  overwrite?: boolean;
  /** Template directory */
  templateDir?: string;
};

/**
 * Context generation result
 */
export type ContextGenerationResult = {
  /** Generated context file path */
  contextFile: string;
  /** Number of generated types */
  generatedTypes: number;
  /** Generation timestamp */
  generatedAt: string;
};

/**
 * Template variable context for context generation
 */
export type ContextTemplateVariables = {
  /** Entity name variants */
  entityName: {
    /** Original name */
    raw: string;
    /** PascalCase */
    pascal: string;
    /** camelCase */
    camel: string;
    /** kebab-case */
    kebab: string;
    /** snake_case */
    snake: string;
    /** SCREAMING_SNAKE_CASE */
    screamingSnake: string;
    /** Plural form */
    plural: string;
    /** Singular form */
    singular: string;
  };

  /** File paths */
  paths: {
    /** Types file */
    typesFile: string;
    /** Config file */
    configFile: string;
    /** Context file */
    contextFile: string;
    /** Index file */
    indexFile: string;
  };

  /** Export names */
  exports: {
    /** Interface name */
    interfaceName: string;
    /** Type import name */
    typeImportName: string;
    /** Config import name */
    configImportName: string;
    /** Fields export name */
    fieldsExportName: string;
    /** Meta export name */
    metaExportName: string;
    /** Database export name */
    dbExportName: string;
  };

  /** Generated type names */
  generatedTypes: {
    /** Relation key type */
    relationKey: string;
    /** Selectable field type */
    selectableField: string;
    /** Sortable field type */
    sortableField: string;
    /** Filterable field type */
    filterableField: string;
    /** Creatable field type */
    creatableField: string;
    /** List query type */
    listQuery: string;
    /** Item query type */
    itemQuery: string;
    /** One relation query type */
    oneRelationQuery: string;
    /** Many relation query type */
    manyRelationQuery: string;
  };
};
