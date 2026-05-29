import { Ref } from '../../ref/definition';

export type ModelCategory = 'public' | 'safe' | 'create' | 'patch' | 'query' | 'context' | 'custom';

export interface ModelDefinition<TSource = unknown> {
  /**
   * Derivation source only.
   * This does not mean generated inheritance.
   */
  from: Ref<TSource>;

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

  metadata?: Record<string, unknown>;
}
