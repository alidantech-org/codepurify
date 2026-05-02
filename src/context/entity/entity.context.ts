/**
 * Codepurify template context registry chunk: entity
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const entity_context = {
  /**
   * Current entity metadata and normalized naming information.
   */
  entity: {
    /** Normalized entity name variants. */
    name: {
      /** Raw entity name from config, for example App. */
      raw: 'entity.name.raw',

      /** PascalCase entity name, for example AppApiKey. */
      pascal: 'entity.name.pascal',

      /** camelCase entity name, for example appApiKey. */
      camel: 'entity.name.camel',

      /** kebab-case entity name, for example app-api-key. */
      kebab: 'entity.name.kebab',

      /** snake_case entity name, for example app_api_key. */
      snake: 'entity.name.snake',

      /** SCREAMING_SNAKE_CASE entity name, for example APP_API_KEY. */
      constant: 'entity.name.constant',

      /** Singular entity name. */
      singular: 'entity.name.singular',

      /** Plural entity name. */
      plural: 'entity.name.plural',
    },

    /** Entity grouping/module metadata. */
    group: {
      /** Raw group name from metadata. */
      raw: 'entity.group.raw',

      /** PascalCase group name. */
      pascal: 'entity.group.pascal',

      /** camelCase group name. */
      camel: 'entity.group.camel',

      /** kebab-case group name. */
      kebab: 'entity.group.kebab',

      /** snake_case group name. */
      snake: 'entity.group.snake',

      /** SCREAMING_SNAKE_CASE group name. */
      constant: 'entity.group.constant',
    },

    /** Entity runtime/API metadata from EntityMeta. */
    meta: {
      /** Entity metadata name. */
      name: 'entity.meta.name',

      /** Entity group/module name. */
      group_name: 'entity.meta.group_name',

      /** Database schema name. */
      schema: 'entity.meta.schema',

      /** SQL table name. */
      table_name: 'entity.meta.table_name',

      /** Mongo collection name, when available. */
      collection_name: 'entity.meta.collection_name',

      /** API route segment. */
      route: 'entity.meta.route',

      /** Runtime entity class name. */
      entity_class: 'entity.meta.entity_class',

      /** Dependency injection repository token, when available. */
      repository_token: 'entity.meta.repository_token',
    },

    /** Entity source and generated file paths. */
    files: {
      /** Entity folder path. */
      folder_path: 'entity.files.folder_path',

      /** User-owned types file path. */
      types_file: 'entity.files.types_file',

      /** User-owned config file path. */
      config_file: 'entity.files.config_file',

      /** Generated context file path. */
      context_file: 'entity.files.context_file',

      /** Barrel index file path. */
      index_file: 'entity.files.index_file',
    },

    /** Import aliases and export names discovered from entity files. */
    exports: {
      /** TypeScript interface export name, for example IApp. */
      interface_name: 'entity.exports.interface_name',

      /** Entity fields constant export name, for example APP_FIELDS. */
      fields_export_name: 'entity.exports.fields_export_name',

      /** Entity meta constant export name, for example APP_META. */
      meta_export_name: 'entity.exports.meta_export_name',

      /** Entity DB definition export name, for example APP_DB. */
      db_export_name: 'entity.exports.db_export_name',

      /** Types namespace import alias. */
      type_import_name: 'entity.exports.type_import_name',

      /** Config namespace import alias. */
      config_import_name: 'entity.exports.config_import_name',
    },
  },
} as const;
