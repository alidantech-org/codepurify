import { Ref } from '../../ref/definition';

export interface OperationInputDefinition {
  params?: Record<string, Ref>;

  query?: Ref;

  body?: Ref;
}

export interface OperationDefinition {
  description?: string;

  input?: OperationInputDefinition;

  output?: Ref;

  metadata?: Record<string, unknown>;
}
