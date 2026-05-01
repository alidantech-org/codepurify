export const fields_context = {
  /** Field arrays from DefineKeysArray<TEntity>. */
  fields: {
    query: {
      /** Fields clients may explicitly select. */
      selectable: ['fields.query.selectable[]'],

      /** Fields selected by default. */
      default_select: ['fields.query.default_select[]'],

      /** Fields clients may sort by. */
      sortable: ['fields.query.sortable[]'],

      /** Fields used by global search. */
      searchable: ['fields.query.searchable[]'],

      /** Fields clients may filter by exact value. */
      filterable: ['fields.query.filterable[]'],

      /** Fields that support date-range filters. */
      date_range: ['fields.query.date_range[]'],
    },

    mutation: {
      creatable: ['fields.mutation.creatable[]'],
      system_creatable: ['fields.mutation.system_creatable[]'],
      updatable: ['fields.mutation.updatable[]'],
      editable: ['fields.mutation.editable[]'],
      readonly: ['fields.mutation.readonly[]'],
      immutable: ['fields.mutation.immutable[]'],
    },

    relation: {
      keys: ['fields.relation.keys[]'],
    },

    state: {
      transition: ['fields.state.transition[]'],
      toggle: ['fields.state.toggle[]'],
    },

    business: {
      contextual: ['fields.business.contextual[]'],
    },

    security: {
      sensitive: ['fields.security.sensitive[]'],
    },

    system: {
      persisted: ['fields.system.persisted[]'],
      computed: ['fields.system.computed[]'],
    },
  },
} as const;
