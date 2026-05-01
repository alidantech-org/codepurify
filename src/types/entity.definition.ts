/**
 * Tempurify Entity Definition Types
 *
 * Defines the structure for entity definitions and parsing results.
 * Provides types for parsed entity information used by generators.
 */

/**
 * Parsed entity definition from entity folder
 */
export type ParsedEntityDefinition = {
  /** Entity name */
  entityName: string;
  /** Folder path */
  folderPath: string;
  /** Types file path */
  typesFile: string;
  /** Config file path */
  configFile: string;
  /** Context file path */
  contextFile: string;

  /** Type import name (e.g., T) */
  typeImportName: string;
  /** Config import name (e.g., TC) */
  configImportName: string;

  /** Interface name (e.g., IApp) */
  interfaceName: string;
  /** Meta export name (e.g., APP_META) */
  metaExportName: string;
  /** Fields export name (e.g., APP_FIELDS) */
  fieldsExportName: string;
  /** Database export name (e.g., APP_DB) */
  dbExportName: string;

  /** Name variants for code generation */
  names: {
    /** PascalCase name */
    pascal: string;
    /** camelCase name */
    camel: string;
    /** kebab-case name */
    kebab: string;
    /** snake_case name */
    snake: string;
    /** SCREAMING_SNAKE_CASE name */
    screamingSnake: string;
    /** Plural form */
    plural: string;
    /** Singular form */
    singular: string;
  };
};

/**
 * Entity folder structure validation
 */
export type EntityFolderStructure = {
  /** Required files */
  required: {
    /** Types file path */
    typesFile: string;
    /** Config file path */
    configFile: string;
  };
  /** Generated files */
  generated: {
    /** Context file path */
    contextFile: string;
    /** Index file path */
    indexFile: string;
  };
};

/**
 * Entity export validation
 */
export type EntityExports = {
  /** Required exports from types file */
  typesExports: {
    /** Main interface name */
    interfaceName: string;
  };
  /** Required exports from config file */
  configExports: {
    /** Fields export name */
    fieldsExportName: string;
    /** Meta export name */
    metaExportName: string;
    /** Database export name */
    dbExportName: string;
  };
  /** Generated exports from context file */
  contextExports: {
    /** Relation key type name */
    relationKeyName: string;
    /** Selectable field type name */
    selectableFieldName: string;
    /** Sortable field type name */
    sortableFieldName: string;
    /** Filterable field type name */
    filterableFieldName: string;
    /** Creatable field type name */
    creatableFieldName: string;
    /** List query type name */
    listQueryName: string;
    /** Item query type name */
    itemQueryName: string;
    /** One relation query type name */
    oneRelationQueryName: string;
    /** Many relation query type name */
    manyRelationQueryName: string;
  };
};
