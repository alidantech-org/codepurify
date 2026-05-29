import { Ref } from '../../_shared/ref/definition';
import { EntityDefinition } from '../entity/definition';

export const ModelCategory = {
  public: 'public',
  safe: 'safe',
  create: 'create',
  patch: 'patch',
  query: 'query',
  context: 'context',
  custom: 'custom',
} as const;

export type ModelCategory = (typeof ModelCategory)[keyof typeof ModelCategory];

export interface ModelDefinition {
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

  pick?: string[];

  omit?: string[];

  partial?: boolean;

  /**
   * Optional required-field override after pick/omit/partial.
   */
  required?: string[];

  description?: string;

  meta: Record<string, unknown>;
}
