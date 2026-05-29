import { PrimitiveDefinition } from '../../properties/primitive/definition';
import { Ref } from '../../_shared/ref/definition';

export interface ParamFieldDefinition {
  ref: Ref<PrimitiveDefinition>;

  description?: string;

  required?: boolean;

  deprecated?: boolean;

  meta: Record<string, unknown>;
}

export interface ParamsDefinition {
  fields: Record<string, ParamFieldDefinition>;

  description?: string;

  meta: Record<string, unknown>;
}
