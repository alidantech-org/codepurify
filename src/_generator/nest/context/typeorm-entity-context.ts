/**
 * TypeORM Entity Template Context
 *
 * Defines the shape of data passed to the TypeORM entity template.
 * This context normalizes entity configuration and DB metadata into
 * template-ready values for generating TypeORM entity classes.
 */

export interface TypeOrmEntityTemplateContext {
  /** Entity information */
  entity: {
    names: {
      pascal: string;
      camel: string;
      kebab: string;
      plural: string;
    };
    exports: {
      interfaceName: string;
    };
    module: {
      name: string;
      path: string;
    };
  };

  /** Import statements */
  imports: {
    schemaConstant: {
      name: string;
      path: string;
    };
    interface: {
      name: string;
      path: string;
    };
    enums?: {
      namespace: 'E';
      path: string;
    };
    relations: Array<{
      className: string;
      path: string;
    }>;
  };

  /** Base entity configuration */
  base: {
    className: string;
    importPath: string;
  };

  /** Schema configuration */
  schema: {
    schemaExpression: string;
    tableExpression: string;
  };

  /** Database indexes */
  indexes: Array<{
    expression: string;
  }>;

  /** Column definitions grouped by type */
  columns: {
    groups: Array<{
      key: string;
      title: string;
      items: TypeOrmColumnTemplateItem[];
    }>;
  };

  /** Relation definitions grouped by type */
  relations: {
    groups: Array<{
      key: string;
      title: string;
      items: TypeOrmRelationTemplateItem[];
    }>;
  };
}

/** Column template item */
export interface TypeOrmColumnTemplateItem {
  propertyName: string;
  columnName: string;
  tsType: string;
  optional: boolean;
  group: 'foreignKey' | 'enum' | 'string' | 'number' | 'boolean' | 'date' | 'json';
  decoratorOptions: string;
}

/** Relation template item */
export interface TypeOrmRelationTemplateItem {
  propertyName: string;
  decoratorName: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  targetEntityClass: string;
  inverseSide: string;
  optionsExpression?: string;
  tsType: string;
  readonly: boolean;
  optional: boolean;
}
