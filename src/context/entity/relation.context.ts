/**
 * Codepurify template context registry chunk: relation
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const relation_context = {
  /**
   * Relation metadata inferred from EntityDBDefinition relations.
   */
  relation: {
    /** Relation property key on the current entity. */
    key: 'relation.key',

    /** Normalized relation property name variants. */
    name: {
      /** Raw relation property name. */
      raw: 'relation.name.raw',

      /** PascalCase relation property name. */
      pascal: 'relation.name.pascal',

      /** camelCase relation property name. */
      camel: 'relation.name.camel',

      /** kebab-case relation property name. */
      kebab: 'relation.name.kebab',

      /** snake_case relation property name. */
      snake: 'relation.name.snake',

      /** SCREAMING_SNAKE_CASE relation property name. */
      constant: 'relation.name.constant',
    },

    /** Relation config values. */
    config: {
      /** Relation kind, for example many-to-one or one-to-many. */
      kind: 'relation.config.kind',

      /** Related entity metadata object or token. */
      entity_meta: 'relation.config.entity_meta',

      /** Optional related module override. */
      module: 'relation.config.module',

      /** Optional relation property override. */
      property_name: 'relation.config.property_name',

      /** Inverse side property on the related entity. */
      inverse_side: 'relation.config.inverse_side',

      /** Whether relation is nullable. */
      nullable: 'relation.config.nullable',

      /** Whether relation cascades operations. */
      cascade: 'relation.config.cascade',

      /** Whether relation is eager-loaded. */
      eager: 'relation.config.eager',

      /** Whether relation is lazy-loaded. */
      lazy: 'relation.config.lazy',

      /** Join column name. */
      join_column: 'relation.config.join_column',

      /** Inverse join column name. */
      inverse_join_column: 'relation.config.inverse_join_column',

      /** Referenced column name. */
      referenced_column: 'relation.config.referenced_column',

      /** Join table config or name. */
      join_table: 'relation.config.join_table',

      /** Delete referential action. */
      on_delete: 'relation.config.on_delete',

      /** Update referential action. */
      on_update: 'relation.config.on_update',

      /** Foreign key name. */
      foreign_key_name: 'relation.config.foreign_key_name',
    },

    /** Related entity metadata resolved from relation target. */
    target: {
      /** Related entity raw name. */
      name: 'relation.target.name',

      /** Related entity module/group name. */
      group: 'relation.target.group',

      /** Related entity class name. */
      entity_class: 'relation.target.entity_class',

      /** Related entity API route. */
      route: 'relation.target.route',

      /** Related entity table name. */
      table_name: 'relation.target.table_name',

      /** Related entity normalized name variants. */
      naming: {
        /** Related entity PascalCase name. */
        pascal: 'relation.target.naming.pascal',

        /** Related entity camelCase name. */
        camel: 'relation.target.naming.camel',

        /** Related entity kebab-case name. */
        kebab: 'relation.target.naming.kebab',

        /** Related entity snake_case name. */
        snake: 'relation.target.naming.snake',

        /** Related entity SCREAMING_SNAKE_CASE name. */
        constant: 'relation.target.naming.constant',
      },
    },
  },
} as const;
