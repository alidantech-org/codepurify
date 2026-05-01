import { createNameVariants } from '../../../utils/case';
import type { DiscoveredEntityFolder } from '../parser/entity-folder-parser';
import type { ParsedEntityConfig } from '../parser/config-parser';
import type { ParsedEntityType } from '../parser/entity-parser';

/**
 * Entity file paths context
 */
export interface EntityFilesContext {
  /** Entity folder path */
  folderPath: string;
  /** Types file path */
  typesFile: string;
  /** Config file path */
  configFile: string;
  /** Context file path */
  contextFile: string;
  /** Index file path */
  indexFile: string;
}

/**
 * Entity export names context
 */
export interface EntityExportsContext {
  /** Interface name from types file */
  interfaceName: string;
  /** Fields export name from config */
  fieldsExportName: string;
  /** Meta export name from config */
  metaExportName: string;
  /** Database export name from config */
  dbExportName: string;
}

/**
 * Entity metadata context
 */
export interface EntityMetaContext {
  /** Entity name */
  name: string;
  /** Module name */
  module: string;
  /** Schema name */
  schema: string;
  /** Table name */
  tableName: string;
  /** Route name */
  route: string;
  /** Entity class name */
  entityClass: string;
}

/**
 * Generated type names context
 */
export interface GeneratedTypeNamesContext {
  /** Relation key type name */
  relationKeyType: string;
  /** Selectable field type name */
  selectableFieldType: string;
  /** Sortable field type name */
  sortableFieldType: string;
  /** Filterable field type name */
  filterableFieldType: string;
  /** Creatable field type name */
  creatableFieldType: string;
  /** Updatable field type name */
  updatableFieldType: string;
  /** List query type name */
  listQueryType: string;
  /** Item query type name */
  itemQueryType: string;
  /** Create input type name */
  createInputType: string;
  /** Update input type name */
  updateInputType: string;
  /** As one relation query type name */
  asOneRelationQueryType: string;
  /** As many relation query type name */
  asManyRelationQueryType: string;
}

/**
 * Relation map names context
 */
export interface RelationMapNamesContext {
  /** Entity relations map name */
  entityRelationsMap: string;
  /** Relation targets map name */
  relationTargetsMap: string;
  /** Relation fields map name */
  relationFieldsMap: string;
}

/**
 * Complete entity context
 */
export interface EntityContext {
  /** Name variants for the entity */
  names: {
    pascal: string;
    camel: string;
    kebab: string;
    snake: string;
    screamingSnake: string;
    plural: string;
    singular: string;
  };
  /** File paths */
  files: EntityFilesContext;
  /** Export names */
  exports: EntityExportsContext;
  /** Entity metadata */
  entity: EntityMetaContext;
  /** Generated type names */
  generated: GeneratedTypeNamesContext;
  /** Relation map names */
  relationMaps: RelationMapNamesContext;
}

/**
 * Build entity context from parsed entity data
 *
 * @param folder - Discovered entity folder
 * @param config - Parsed entity configuration
 * @param entityType - Parsed entity type
 * @returns EntityContext - Complete entity context
 */
export function buildEntityContext(
  folder: DiscoveredEntityFolder,
  config: ParsedEntityConfig,
  entityType: ParsedEntityType,
): EntityContext {
  const names = createNameVariants(folder.entityName);

  // Build file paths context
  const files: EntityFilesContext = {
    folderPath: folder.folderPath,
    typesFile: folder.typesFilePath,
    configFile: folder.configFilePath,
    contextFile: `${folder.folderPath}/app.context.ts`,
    indexFile: `${folder.folderPath}/index.ts`,
  };

  // Build export names context
  const exports: EntityExportsContext = {
    interfaceName: entityType.interfaceName,
    fieldsExportName: config.fieldsExportName,
    metaExportName: config.metaExportName,
    dbExportName: config.dbExportName,
  };

  // Build entity metadata context
  const entity: EntityMetaContext = {
    name: config.meta.name,
    module: config.meta.module,
    schema: config.meta.schema,
    tableName: config.meta.tableName,
    route: config.meta.route,
    entityClass: config.meta.entityClass,
  };

  // Build generated type names context
  const generated: GeneratedTypeNamesContext = {
    relationKeyType: `${names.pascal}RelationKey`,
    selectableFieldType: `${names.pascal}SelectableField`,
    sortableFieldType: `${names.pascal}SortableField`,
    filterableFieldType: `${names.pascal}FilterableField`,
    creatableFieldType: `${names.pascal}CreatableField`,
    updatableFieldType: `${names.pascal}UpdatableField`,
    listQueryType: `I${names.pascal}ListQuery`,
    itemQueryType: `I${names.pascal}ItemQuery`,
    createInputType: `I${names.pascal}CreateInput`,
    updateInputType: `I${names.pascal}UpdateInput`,
    asOneRelationQueryType: `I${names.pascal}AsOneRelationQuery`,
    asManyRelationQueryType: `I${names.pascal}AsManyRelationQuery`,
  };

  // Build relation map names context
  const relationMaps: RelationMapNamesContext = {
    entityRelationsMap: `${names.camel}Relations`,
    relationTargetsMap: `${names.camel}RelationTargets`,
    relationFieldsMap: `${names.camel}RelationFields`,
  };

  return {
    names: {
      pascal: names.pascal,
      camel: names.camel,
      kebab: names.kebab,
      snake: names.snake,
      screamingSnake: names.screamingSnake,
      plural: names.plural,
      singular: names.singular,
    },
    files,
    exports,
    entity,
    generated,
    relationMaps,
  };
}

/**
 * Create entity context from minimal data
 *
 * @param entityName - Entity name
 * @param folderPath - Entity folder path
 * @param interfaceName - Interface name
 * @returns EntityContext - Basic entity context
 */
export function createBasicEntityContext(entityName: string, folderPath: string, interfaceName: string): EntityContext {
  const names = createNameVariants(entityName);

  return {
    names: {
      pascal: names.pascal,
      camel: names.camel,
      kebab: names.kebab,
      snake: names.snake,
      screamingSnake: names.screamingSnake,
      plural: names.plural,
      singular: names.singular,
    },
    files: {
      folderPath,
      typesFile: `${folderPath}/app.types.ts`,
      configFile: `${folderPath}/app.config.ts`,
      contextFile: `${folderPath}/app.context.ts`,
      indexFile: `${folderPath}/index.ts`,
    },
    exports: {
      interfaceName,
      fieldsExportName: 'APP_FIELDS',
      metaExportName: 'APP_META',
      dbExportName: 'APP_DB',
    },
    entity: {
      name: entityName,
      module: names.camel,
      schema: 'public',
      tableName: names.snake,
      route: `/${names.kebab}`,
      entityClass: names.pascal,
    },
    generated: {
      relationKeyType: `${names.pascal}RelationKey`,
      selectableFieldType: `${names.pascal}SelectableField`,
      sortableFieldType: `${names.pascal}SortableField`,
      filterableFieldType: `${names.pascal}FilterableField`,
      creatableFieldType: `${names.pascal}CreatableField`,
      updatableFieldType: `${names.pascal}UpdatableField`,
      listQueryType: `I${names.pascal}ListQuery`,
      itemQueryType: `I${names.pascal}ItemQuery`,
      createInputType: `I${names.pascal}CreateInput`,
      updateInputType: `I${names.pascal}UpdateInput`,
      asOneRelationQueryType: `I${names.pascal}AsOneRelationQuery`,
      asManyRelationQueryType: `I${names.pascal}AsManyRelationQuery`,
    },
    relationMaps: {
      entityRelationsMap: `${names.camel}Relations`,
      relationTargetsMap: `${names.camel}RelationTargets`,
      relationFieldsMap: `${names.camel}RelationFields`,
    },
  };
}
