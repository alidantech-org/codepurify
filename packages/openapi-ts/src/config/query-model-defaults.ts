export type QuerySortMode = 'flat-prefixed-field' | 'field-direction-object' | 'flat-field-direction';

export type QueryFieldValueMode = 'field-schema' | 'string' | 'boolean' | 'array';

export type QueryRangeMode = 'field-schema';

export interface QueryModelOptions {
  readonly emitEmptyQueryModels: boolean;

  readonly exact: {
    readonly valueMode: 'field-schema';
  };

  readonly exactSearch: {
    readonly valueMode: 'field-schema';
  };

  readonly search: {
    readonly valueMode: 'field-schema' | 'string';
  };

  readonly in: {
    readonly valueMode: 'array';
  };

  readonly exists: {
    readonly valueMode: 'boolean' | 'field-schema';
  };

  readonly range: {
    readonly mode: QueryRangeMode;
  };

  readonly sort: {
    readonly mode: QuerySortMode;
    readonly directions: readonly ['asc', 'desc'];
    readonly prefixes: {
      readonly asc: string;
      readonly desc: string;
    };
    readonly separator: string;
  };
}

export const DEFAULT_QUERY_MODEL_OPTIONS: QueryModelOptions = {
  emitEmptyQueryModels: true,

  exact: {
    valueMode: 'field-schema',
  },

  exactSearch: {
    valueMode: 'field-schema',
  },

  search: {
    valueMode: 'field-schema',
  },

  in: {
    valueMode: 'array',
  },

  exists: {
    valueMode: 'boolean',
  },

  range: {
    mode: 'field-schema',
  },

  sort: {
    mode: 'flat-prefixed-field',
    directions: ['asc', 'desc'],
    prefixes: {
      asc: '+',
      desc: '-',
    },
    separator: ':',
  },
};
