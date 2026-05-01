/**
 * Tempurify template context registry chunk: index
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const index_context = {
  /**
   * Single index metadata inferred from DB index config.
   */
  index: {
    /** Index field list. */
    fields: ['index.fields[]'],

    /** Index name. */
    name: 'index.name',

    /** Whether index is unique. */
    unique: 'index.unique',

    /** Whether index is sparse. */
    sparse: 'index.sparse',

    /** Whether index is built in background. */
    background: 'index.background',

    /** Expiration seconds for TTL indexes. */
    expire_after_seconds: 'index.expire_after_seconds',

    /** Partial/where clause for SQL indexes. */
    where: 'index.where',

    /** Mongo partial filter expression. */
    partial_filter_expression: 'index.partial_filter_expression',

    /** Index algorithm/type. */
    using: 'index.using',
  },
} as const;
