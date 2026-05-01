/**
 * Tempura Relation Definition Types
 * 
 * Defines the structure for entity relations and query types.
 * Provides types for relation configurations and generated query contracts.
 */

/**
 * Relation types for entity relationships
 */
export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

/**
 * Relation configuration metadata
 */
export type RelationConfig = {
  /** Relation type */
  type: RelationType;
  /** Related entity name */
  entityName: string;
  /** Related entity module */
  entityModule: string;
  /** Field name in current entity */
  fieldName: keyof any;
  /** Field name in related entity */
  inverseFieldName?: keyof any;
  /** Whether relation is nullable */
  nullable?: boolean;
  /** Whether to cascade operations */
  cascade?: boolean;
  /** Join column configuration */
  joinColumn?: {
    /** Join column name */
    name: string;
    /** Referenced column name */
    referencedColumnName: string;
  };
  /** Join table configuration for many-to-many */
  joinTable?: {
    /** Join table name */
    name: string;
    /** Join column name */
    joinColumn: string;
    /** Inverse join column name */
    inverseJoinColumn: string;
  };
};

/**
 * Relation query parameter types
 */
export type RelationQueryTypes = {
  /** One relation query parameters */
  oneRelationQuery: {
    /** Fields to select from related entity */
    fields?: readonly string[];
  };
  /** Many relation query parameters */
  manyRelationQuery: {
    /** Fields to select from related entity */
    fields?: readonly string[];
    /** Field to sort by */
    sortBy?: readonly string[];
    /** Sort direction */
    sortOrder?: readonly ('asc' | 'desc')[];
    /** Page number */
    page?: number;
    /** Number of items per page */
    limit?: number;
  };
};

/**
 * Generated relation type definitions
 */
export type GeneratedRelationTypes = {
  /** Relation key type */
  relationKey: string;
  /** One relation query type */
  oneRelationQuery: string;
  /** Many relation query type */
  manyRelationQuery: string;
  /** Relation map type */
  relationMap: string;
};

/**
 * Relation context for template generation
 */
export type RelationContext = {
  /** Relation configuration */
  config: RelationConfig;
  /** Generated type names */
  typeNames: GeneratedRelationTypes;
  /** Related entity context */
  relatedEntity: {
    /** Entity name */
    name: string;
    /** Module name */
    module: string;
    /** Pascal case name */
    pascalName: string;
    /** Camel case name */
    camelName: string;
  };
};
