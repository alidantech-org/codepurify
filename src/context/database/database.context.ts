/**
 * Tempurify template context registry chunk: db
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const db_context = {
  /**
   * Database target and entity storage definition.
   */
  db: {
    /** Database target information. */
    target: {
      /** DB provider, for example typeorm, sql, mongo, mongoose, or custom. */
      provider: 'db.target.provider',

      /** SQL dialect, when applicable. */
      dialect: 'db.target.dialect',

      /** SQL schema name. */
      schema: 'db.target.schema',

      /** SQL table name. */
      table_name: 'db.target.table_name',

      /** Mongo collection name. */
      collection_name: 'db.target.collection_name',

      /** Custom target name. */
      name: 'db.target.name',
    },

    /** DB definition options. */
    options: {
      /** Whether timestamp columns are enabled. */
      timestamps: 'db.options.timestamps',

      /** Whether soft delete support is enabled. */
      soft_delete: 'db.options.soft_delete',

      /** Whether versioning support is enabled. */
      versioning: 'db.options.versioning',

      /** Whether audit metadata is enabled. */
      audit: 'db.options.audit',

      /** Whether multi-tenant metadata is enabled. */
      multi_tenant: 'db.options.multi_tenant',

      /** Custom DB options. */
      custom: 'db.options.custom',
    },
  },
} as const;
