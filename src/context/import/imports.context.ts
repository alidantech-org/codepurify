/**
 * Tempurify template context registry chunk: imports
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const imports_context = {
  /**
   * Import path and symbol information exposed to templates.
   */
  imports: {
    /** Shared query contract import path. */
    shared_query: 'imports.shared_query',

    /** Shared base contract import path. */
    shared_base: 'imports.shared_base',

    /** Entity types import path. */
    entity_types: 'imports.entity_types',

    /** Entity config import path. */
    entity_config: 'imports.entity_config',

    /** Entity context import path. */
    entity_context: 'imports.entity_context',

    /** Enum import path, when used. */
    enums: 'imports.enums',

    /** Relation imports. */
    relations: [
      {
        /** Relation import path. */
        path: 'imports.relations[].path',

        /** Relation namespace alias. */
        alias: 'imports.relations[].alias',

        /** Relation class/type symbol. */
        symbol: 'imports.relations[].symbol',
      },
    ],
  },
} as const;
