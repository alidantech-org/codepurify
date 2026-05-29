import { RefProperty } from '../../properties/definition';
import { Ref } from '../../_shared/ref/definition';
import { RefSchema } from '../../schema/definition';

export interface DtoDefinition {
  extends?: Ref<RefSchema>;

  fields?: Record<string, Ref<RefProperty>>;

  partial?: boolean;

  description?: string;

  meta: Record<string, unknown>;
}
