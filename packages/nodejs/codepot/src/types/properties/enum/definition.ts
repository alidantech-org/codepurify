import { Ref } from '../../ref/definition';

export interface EnumDefinition {
  values: readonly string[];

  description?: string;

  resource?: Ref;

  entity?: Ref;

  metadata?: Record<string, unknown>;
}
