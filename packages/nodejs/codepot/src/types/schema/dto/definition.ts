import { Ref } from '../../ref/definition';

export interface DtoDefinition {
  extends?: Ref;

  fields?: Record<string, Ref>;

  partial?: boolean;

  metadata?: Record<string, unknown>;
}
