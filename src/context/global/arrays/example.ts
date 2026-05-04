import type { ArrayItemContext, ArrayChildContext, ArraysContext } from './type';

/**
 * Example demonstrating the ArrayItemContext, ArrayChildContext, and ArraysContext types
 * 
 * This shows how the array context system provides structured, indexed access
 * to collections of items with rich metadata.
 */

// Example payload type for individual items
interface FieldItemPayload {
  name: string;
  type: string;
  nullable: boolean;
  required: boolean;
}

interface RelationItemPayload {
  targetEntity: string;
  relationType: 'One' | 'Many';
  cascade: boolean;
}

// Example ArrayItemContext with FieldItemPayload
type FieldItemContext = ArrayItemContext<FieldItemPayload>;

// Example ArrayItemContext with RelationItemPayload
type RelationItemContext = ArrayItemContext<RelationItemPayload>;

// Example ArrayChildContext containing field items
type FieldsArrayContext = ArrayChildContext<FieldItemPayload>;

// Example ArrayChildContext containing relation items
type RelationsArrayContext = ArrayChildContext<RelationItemPayload>;

// Example ArraysContext containing multiple array types
type EntityArraysContext = ArraysContext<{
  fields: FieldsArrayContext;
  relations: RelationsArrayContext;
}>;

/**
 * Complete example of an EntityArraysContext
 * 
 * This demonstrates how the array context system would be used
 * for an entity with multiple fields and relations.
 */
export const exampleEntityArraysContext: EntityArraysContext = {
  fields: {
    length: 4,
    items: [
      {
        index: 0,
        name: 'id',
        type: 'uuid',
        nullable: false,
        required: true,
      },
      {
        index: 1,
        name: 'firstName',
        type: 'string',
        nullable: false,
        required: true,
      },
      {
        index: 2,
        name: 'lastName',
        type: 'string',
        nullable: false,
        required: true,
      },
      {
        index: 3,
        name: 'email',
        type: 'string',
        nullable: true,
        required: false,
      },
    ],
  },
  relations: {
    length: 2,
    items: [
      {
        index: 0,
        targetEntity: 'Profile',
        relationType: 'One',
        cascade: false,
      },
      {
        index: 1,
        targetEntity: 'Roles',
        relationType: 'Many',
        cascade: true,
      },
    ],
  },
};

/**
 * Example with different payload types
 * 
 * Shows how the array context system can handle different
 * types of payloads with the same structure.
 */

interface CharacterPayload {
  char: string;
  position: number;
  isUpperCase: boolean;
}

interface WordPayload {
  word: string;
  syllableCount: number;
  isFirstWord: boolean;
}

type CharacterArrayContext = ArrayChildContext<CharacterPayload>;
type WordArrayContext = ArrayChildContext<WordPayload>;

type NameArraysContext = ArraysContext<{
  characters: CharacterArrayContext;
  words: WordArrayContext;
}>;

export const exampleNameArraysContext: NameArraysContext = {
  characters: {
    length: 15,
    items: [
      { index: 0, char: 'U', position: 0, isUpperCase: true },
      { index: 1, char: 's', position: 1, isUpperCase: false },
      { index: 2, char: 'e', position: 2, isUpperCase: false },
      { index: 3, char: 'r', position: 3, isUpperCase: false },
      { index: 4, char: 'P', position: 4, isUpperCase: true },
      { index: 5, char: 'r', position: 5, isUpperCase: false },
      { index: 6, char: 'o', position: 6, isUpperCase: false },
      { index: 7, char: 'f', position: 7, isUpperCase: false },
      { index: 8, char: 'i', position: 8, isUpperCase: false },
      { index: 9, char: 'l', position: 9, isUpperCase: false },
      { index: 10, char: 'e', position: 10, isUpperCase: false },
      { index: 11, char: 'S', position: 11, isUpperCase: true },
      { index: 12, char: 'e', position: 12, isUpperCase: false },
      { index: 13, char: 't', position: 13, isUpperCase: false },
      { index: 14, char: 't', position: 14, isUpperCase: false },
    ],
  },
  words: {
    length: 3,
    items: [
      { index: 0, word: 'User', syllableCount: 1, isFirstWord: true },
      { index: 1, word: 'Profile', syllableCount: 2, isFirstWord: false },
      { index: 2, word: 'Settings', syllableCount: 2, isFirstWord: false },
    ],
  },
};

/**
 * Example usage in templates showing how to access array context data
 */
export const templateUsageExamples = {
  // Basic field iteration
  fieldIteration: `
{{#each arrays.fields.items}}
  {{index}}: {{name}}: {{type}}{{#if nullable}}?{{/if}}
{{/each}}`,
  // Output:
  // 0: id: uuid
  // 1: firstName: string
  // 2: lastName: string
  // 3: email: string?

  // Accessing specific array items
  specificFieldAccess: `
First field: {{arrays.fields.items.0.name}}
Last field: {{arrays.fields.items.3.name}}
Field count: {{arrays.fields.length}}`,
  // Output:
  // First field: id
  // Last field: email
  // Field count: 4

  // Relation iteration with conditional logic
  relationIteration: `
{{#each arrays.relations.items}}
  {{index}}: {{targetEntity}} ({{relationType}}){{#if cascade}} with cascade{{/if}}
{{/each}}`,
  // Output:
  // 0: Profile (One)
  // 1: Roles (Many) with cascade

  // Character iteration for name processing
  characterIteration: `
{{#each arrays.characters.items}}
  {{#if isUpperCase}}{{char}}{{else}}{{char}}{{/if}}
{{/each}}`,
  // Output: UserProfileSettings

  // Word iteration with metadata
  wordIteration: `
{{#each arrays.words.items}}
  {{#if isFirstWord}}{{word}}{{else}}{{word}}{{/if}} ({{syllableCount}} syllables)
{{/each}}`,
  // Output:
  // User (1 syllables)
  // Profile (2 syllables)
  // Settings (2 syllables)

  // Complex nested access
  nestedAccess: `
First character: {{arrays.characters.items.0.char}}
Last word: {{arrays.words.items.2.word}}
Total characters: {{arrays.characters.length}}
Total words: {{arrays.words.length}}`,
  // Output:
  // First character: U
  // Last word: Settings
  // Total characters: 15
  // Total words: 3

  // Conditional rendering based on array properties
  conditionalRendering: `
{{#if arrays.fields.items}}
  Fields ({{arrays.fields.length}}):
  {{#each arrays.fields.items}}
  - {{name}}: {{type}}
  {{/each}}
{{/if}}

{{#if arrays.relations.items}}
  Relations ({{arrays.relations.length}}):
  {{#each arrays.relations.items}}
  - {{targetEntity}} ({{relationType}})
  {{/each}}
{{/if}}`,
  // Output:
  // Fields (4):
  // - id: uuid
  // - firstName: string
  // - lastName: string
  // - email: string
  //
  // Relations (2):
  // - Profile (One)
  // - Roles (Many)
};

/**
 * Utility functions for working with array contexts
 */
export const arrayContextUtils = {
  /**
   * Get item by index from an ArrayChildContext
   */
  getItemByIndex<T extends ArrayChildContext<any>>(
    arrayContext: T,
    index: number
  ): T['items'][number] | undefined {
    return arrayContext.items.find(item => item.index === index);
  },

  /**
   * Get all items that match a predicate
   */
  filterItems<T extends ArrayChildContext<any>>(
    arrayContext: T,
    predicate: (item: T['items'][number]) => boolean
  ): T['items'][number][] {
    return arrayContext.items.filter(predicate);
  },

  /**
   * Check if array has any items
   */
  hasItems<T extends ArrayChildContext<any>>(arrayContext: T): boolean {
    return arrayContext.length > 0 && arrayContext.items.length > 0;
  },

  /**
   * Get first item from array context
   */
  getFirstItem<T extends ArrayChildContext<any>>(arrayContext: T): T['items'][number] | undefined {
    return arrayContext.items.find(item => item.index === 0);
  },

  /**
   * Get last item from array context
   */
  getLastItem<T extends ArrayChildContext<any>>(arrayContext: T): T['items'][number] | undefined {
    if (arrayContext.items.length === 0) return undefined;
    return arrayContext.items[arrayContext.items.length - 1];
  },
};

/**
 * Type guards for array contexts
 */
export const arrayContextGuards = {
  /**
   * Check if a value is an ArrayChildContext
   */
  isArrayChildContext(value: any): value is ArrayChildContext<any> {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.length === 'number' &&
      Array.isArray(value.items) &&
      value.items.every((item: any) => typeof item.index === 'number')
    );
  },

  /**
   * Check if a value is an ArraysContext
   */
  isArraysContext(value: any): value is ArraysContext<any> {
    return (
      value &&
      typeof value === 'object' &&
      Object.values(value).every(this.isArrayChildContext)
    );
  },
};
