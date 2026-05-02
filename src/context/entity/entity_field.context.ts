/**
 * Codepurify template context registry chunk: field
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const field_context = {
  /**
   * Per-field normalized metadata inferred from entity types and DB definition.
   */
  field: {
    /** Field key in the TypeScript entity interface. */
    key: 'field.key',

    /** Normalized field name variants. */
    name: {
      /** Raw field name. */
      raw: 'field.name.raw',

      /** PascalCase field name. */
      pascal: 'field.name.pascal',

      /** camelCase field name. */
      camel: 'field.name.camel',

      /** kebab-case field name. */
      kebab: 'field.name.kebab',

      /** snake_case field name. */
      snake: 'field.name.snake',

      /** SCREAMING_SNAKE_CASE field name. */
      constant: 'field.name.constant',
    },

    /** TypeScript type metadata for the field. */
    ts: {
      /** Renderable TypeScript type. */
      type: 'field.ts.type',

      /** Whether the field is optional. */
      optional: 'field.ts.optional',

      /** Whether the field is readonly. */
      readonly: 'field.ts.readonly',

      /** Whether the field accepts null. */
      nullable: 'field.ts.nullable',
    },

    /** Database metadata for the field. */
    db: {
      /** Logical DB scalar type. */
      type: 'field.db.type',

      /** Physical column/property name. */
      name: 'field.db.name',

      /** Whether the DB value may be null. */
      nullable: 'field.db.nullable',

      /** Whether the DB value must be unique. */
      unique: 'field.db.unique',

      /** Whether the DB value is indexed. */
      index: 'field.db.index',

      /** DB/application default value expression. */
      default: 'field.db.default',

      /** Field-level DB comment. */
      comment: 'field.db.comment',

      /** Whether value is generated. */
      generated: 'field.db.generated',

      /** Whether field is selected by default at ORM level. */
      select: 'field.db.select',

      /** Whether field is insertable. */
      insert: 'field.db.insert',

      /** Whether field is updateable. */
      update: 'field.db.update',
    },
  },
} as const;
