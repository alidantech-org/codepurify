import { Ref } from '../../ref/definition';

export interface CompositeDefinition {
  description?: string;

  properties: Record<string, Ref>;

  metadata?: Record<string, unknown>;
}
