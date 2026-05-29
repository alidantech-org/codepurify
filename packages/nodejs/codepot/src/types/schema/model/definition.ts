import { Ref } from '../../ref/definition';

export interface ModelDefinition {
  from: Ref;

  pick?: string[];

  omit?: string[];

  partial?: boolean;

  metadata?: Record<string, unknown>;
}
