/**
 * TypeORM Entity Context Builder
 *
 * Builds TypeORM entity template context from existing entity context,
 * configuration, and DB metadata. Normalizes data into template-ready
 * values for generating TypeORM entity classes.
 */

import type { NestEntityContext } from './nest-context-builder';
import type { TypeOrmEntityTemplateContext, TypeOrmColumnTemplateItem, TypeOrmRelationTemplateItem } from './typeorm-entity-context';
import type { FieldContext } from './field-context';

/**
 * Builds TypeORM entity template context
 */
export function buildTypeOrmEntityContext(entityContext: NestEntityContext): any {
  const { entity, fields, relations } = entityContext;

  // Build TypeORM-specific data
  const imports = buildImports(entityContext);
  const base = {
    className: 'BaseUuidEntity',
    importPath: '@/database/schema/base-uuid.entity',
  };
  const schema = buildSchema(entityContext);
  const indexes = buildIndexes(entityContext);
  const columns = buildColumns(entityContext);
  const relationGroups = buildRelations(entityContext);

  // Return hybrid context that works with renderer
  return {
    // Required by renderer
    entity: entityContext.entity,
    fields: entityContext.fields,
    relations: entityContext.relations,

    // TypeORM-specific data
    imports,
    base,
    schema,
    indexes,
    columns,
    typeormRelations: relationGroups,
  };
}

/**
 * Builds import statements
 */
function buildImports(entityContext: NestEntityContext) {
  const { entity, fields, relations } = entityContext;

  const imports: TypeOrmEntityTemplateContext['imports'] = {
    schemaConstant: {
      name: `${entity.entity.module.toUpperCase()}_SCHEMA`,
      path: '@/database/constants/schema',
    },
    interface: {
      name: entity.exports.interfaceName,
      path: `@/types/entities/${entity.entity.module}/${entity.names.kebab}`,
    },
    relations: [],
  };

  // Add enum imports if enum fields exist
  const hasEnumFields = fields.groups.all.some((field: FieldContext) => field.category === 'enum');
  if (hasEnumFields) {
    imports.enums = {
      namespace: 'E',
      path: `@/types/enums/${entity.entity.module}`,
    };
  }

  // Add relation imports
  if (relations.groups.all.length > 0) {
    relations.groups.all.forEach((relation) => {
      imports.relations.push({
        className: `${relation.targetType}Entity`,
        path: `@/modules/${relation.targetType.toLowerCase()}/schema/${relation.targetType.toLowerCase()}.entity`,
      });
    });
  }

  return imports;
}

/**
 * Builds schema configuration
 */
function buildSchema(entityContext: NestEntityContext) {
  const { entity } = entityContext;

  return {
    schemaExpression: `${entity.entity.module.toUpperCase()}_SCHEMA.schema`,
    tableExpression: `${entity.entity.module.toUpperCase()}_SCHEMA.tables.${entity.names.pascal}`,
  };
}

/**
 * Builds database indexes
 */
function buildIndexes(entityContext: NestEntityContext) {
  const { fields } = entityContext;

  const indexes: Array<{ expression: string }> = [];

  // Add indexes from sortable fields (as a basic heuristic)
  fields.groups.all.forEach((field: FieldContext) => {
    if (field.sortable) {
      // For now, assume sortable fields should be indexed
      // In a real implementation, this would come from explicit index configuration
      indexes.push({
        expression: `['${field.name}']`,
      });
    }
  });

  // Add composite indexes if defined in metadata
  // This would come from entity configuration if available

  return indexes;
}

/**
 * Builds column definitions grouped by type
 */
function buildColumns(entityContext: NestEntityContext) {
  const { fields } = entityContext;

  const groups: Array<{ key: string; title: string; items: TypeOrmColumnTemplateItem[] }> = [];

  // Define group order
  const groupOrder = [
    { key: 'foreignKey', title: 'FOREIGN KEY COLUMNS' },
    { key: 'enum', title: 'ENUM FIELDS' },
    { key: 'string', title: 'STRING FIELDS' },
    { key: 'number', title: 'NUMBER FIELDS' },
    { key: 'boolean', title: 'BOOLEAN FIELDS' },
    { key: 'date', title: 'DATE FIELDS' },
    { key: 'json', title: 'JSON FIELDS' },
  ];

  groupOrder.forEach(({ key, title }) => {
    const items = fields.groups.all
      .filter((field: FieldContext) => getColumnGroup(field) === key)
      .map((field: FieldContext) => buildColumnItem(field));

    if (items.length > 0) {
      groups.push({ key, title, items });
    }
  });

  return { groups };
}

/**
 * Determines column group for a field
 */
function getColumnGroup(field: FieldContext): string {
  if (field.category === 'id' && field.isForeignKey) return 'foreignKey';
  if (field.category === 'enum') return 'enum';
  if (field.category === 'primitive') {
    if (field.type === 'string' || field.type === 'text') return 'string';
    if (field.type === 'number' || field.type === 'integer') return 'number';
    if (field.type === 'boolean') return 'boolean';
    if (field.type === 'date' || field.type === 'datetime') return 'date';
    if (field.type === 'json' || field.type === 'object') return 'json';
  }
  if (field.category === 'custom') {
    if (field.type === 'json' || field.type === 'object') return 'json';
  }
  return 'string'; // default
}

/**
 * Builds a single column template item
 */
function buildColumnItem(field: FieldContext): TypeOrmColumnTemplateItem {
  const decoratorOptions = buildColumnDecoratorOptions(field);

  return {
    propertyName: field.name,
    columnName: field.columnName,
    tsType: field.type,
    optional: field.optional || field.nullable,
    group: getColumnGroup(field) as any,
    decoratorOptions,
  };
}

/**
 * Builds TypeORM column decorator options
 */
function buildColumnDecoratorOptions(field: FieldContext): string {
  const options: string[] = [];

  // Add column name if different from property name
  if (field.columnName && field.columnName !== field.name) {
    options.push(`name: '${field.columnName}'`);
  }

  // Add type based on field category
  if (field.category === 'enum') {
    options.push(`type: 'simple-enum'`);
    options.push(`enum: E.${field.type}`);
  } else if (field.category === 'primitive') {
    if (field.type === 'string') {
      options.push(`type: 'varchar'`);
      options.push(`length: 255`);
    } else if (field.type === 'text') {
      options.push(`type: 'text'`);
      options.push(`length: 1000`);
    } else if (field.type === 'number' || field.type === 'integer') {
      options.push(`type: 'integer'`);
    } else if (field.type === 'boolean') {
      options.push(`type: 'boolean'`);
    } else if (field.type === 'date' || field.type === 'datetime') {
      options.push(`type: 'timestamp'`);
    } else if (field.type === 'json' || field.type === 'object') {
      options.push(`type: 'json'`);
    }
  } else if (field.category === 'custom') {
    if (field.type === 'json' || field.type === 'object') {
      options.push(`type: 'json'`);
    }
  }

  // Add nullable
  if (field.nullable) {
    options.push(`nullable: true`);
  }

  // Add default values for common fields
  if (field.name === 'isActive' || field.name === 'isInternal') {
    options.push(`default: false`);
  } else if (field.name === 'status' && field.category === 'enum') {
    options.push(`default: E.${field.type}.Active`);
  } else if (field.name === 'appType' && field.category === 'enum') {
    options.push(`default: E.${field.type}.Customer`);
  }

  return `{ ${options.join(', ')} }`;
}

/**
 * Builds relation definitions grouped by type
 */
function buildRelations(entityContext: NestEntityContext) {
  const { relations } = entityContext;

  const groups: Array<{ key: string; title: string; items: TypeOrmRelationTemplateItem[] }> = [];

  // Define relation group order
  const groupOrder = [
    { key: 'oneToOne', title: 'ONE-TO-ONE RELATIONS' },
    { key: 'manyToOne', title: 'MANY-TO-ONE RELATIONS' },
    { key: 'oneToMany', title: 'ONE-TO-MANY RELATIONS' },
    { key: 'manyToMany', title: 'MANY-TO-MANY RELATIONS' },
  ];

  groupOrder.forEach(({ key, title }) => {
    const items = relations.groups.all
      .filter((relation) => relation.relationType.toLowerCase().replace('to', '') === key)
      .map((relation) => buildRelationItem(relation));

    if (items.length > 0) {
      groups.push({ key, title, items });
    }
  });

  return { groups };
}

/**
 * Builds a single relation template item
 */
function buildRelationItem(relation: any): TypeOrmRelationTemplateItem {
  const decoratorName = getRelationDecoratorName(relation.relationType);
  const targetEntityClass = `${relation.targetType}Entity`;
  const inverseSide = relation.inverseProperty || relation.name.toLowerCase();
  const optionsExpression = buildRelationOptions(relation);

  return {
    propertyName: relation.name,
    decoratorName,
    targetEntityClass,
    inverseSide,
    optionsExpression,
    tsType: relation.targetType,
    readonly: relation.readonly || false,
    optional: relation.nullable || relation.optional || false,
  };
}

/**
 * Gets TypeORM decorator name for relation type
 */
function getRelationDecoratorName(relationType: string): TypeOrmRelationTemplateItem['decoratorName'] {
  switch (relationType.toLowerCase()) {
    case 'onetoone':
      return 'OneToOne';
    case 'manytoone':
      return 'ManyToOne';
    case 'onetomany':
      return 'OneToMany';
    case 'manytomany':
      return 'ManyToMany';
    default:
      return 'OneToMany'; // default fallback
  }
}

/**
 * Builds relation options expression
 */
function buildRelationOptions(relation: any): string | undefined {
  const options: string[] = [];

  if (relation.cascade) {
    options.push('cascade: true');
  }

  if (relation.eager) {
    options.push('eager: true');
  }

  if (relation.orphanRemoval) {
    options.push('orphanRemoval: true');
  }

  return options.length > 0 ? `{ ${options.join(', ')} }` : undefined;
}
