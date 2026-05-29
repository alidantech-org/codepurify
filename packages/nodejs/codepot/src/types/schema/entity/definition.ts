import { EntityField } from './field/definition';
import { Ref } from '../../ref/definition';

export interface EntityDefinition {
  resource?: string;

  tags?: string[];

  extends?: Ref[];

  fields: Record<string, EntityField>;

  metadata?: Record<string, unknown>;
}
