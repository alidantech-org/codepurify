import { Ref } from '../../ref';
import { DefinitionItem } from '../../definition';
import { EntityDefinition } from '../entity/definition';

export const ModelCategory = {
  // access.read === 'public' → safe to expose externally
  read: 'read',

  // access.write is set (any level) → accepted in create payloads
  create: 'create',

  // create fields minus persistence.immutable === true → patchable subset
  patch: 'patch',

  // query.filter === true OR query.sort === true OR query.select === true
  query: 'query',

  // persistence.mode === 'stored' AND access.read !== 'secret' → DB projection
  projection: 'projection',

  // access.sensitive === true OR access.read === 'secret' → strip from responses
  redacted: 'redacted',

  // persistence.mode === 'computed' OR 'virtual' → never written, derived at runtime
  derived: 'derived',

  // access.read === 'internal' OR access.read === 'auth' → backend/service-layer only
  internal: 'internal',
} as const;

export type ModelCategory = (typeof ModelCategory)[keyof typeof ModelCategory];

export interface ModelDefinition extends DefinitionItem {
  /**
   * Derivation source only.
   * This does not mean generated inheritance.
   */
  from: Ref<EntityDefinition>;

  /**
   * Derivation family.
   * Compiler uses this to infer same-category parent inheritance.
   */
  category: ModelCategory;

  /**
   * Field selection.
   */
  pick?: string[];

  /**
   * Field exclusion.
   */
  omit?: string[];

  /**
   * Make all fields optional.
   */
  partial?: boolean;

  /**
   * Optional required-field override after pick/omit/partial.
   */
  required?: string[];
}
