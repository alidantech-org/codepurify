import { Ref } from '../../ref/definition';

export interface CompositeDefinition<TParent = unknown, TProperty = unknown> {
  /**
   * Real composite inheritance/extension.
   * One parent max to keep merging predictable.
   */
  extends?: Ref<TParent>;

  description?: string;

  /**
   * Composite-owned reusable property refs.
   */
  properties: Record<string, Ref<TProperty>>;

  meta: Record<string, unknown>;
}
