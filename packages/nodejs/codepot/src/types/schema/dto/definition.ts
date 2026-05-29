import { Ref } from '../../ref/definition';

export interface DtoDefinition<TParent = unknown, TField = unknown> {
  extends?: Ref<TParent>;

  fields?: Record<string, Ref<TField>>;

  partial?: boolean;

  description?: string;

  metadata?: Record<string, unknown>;
}
