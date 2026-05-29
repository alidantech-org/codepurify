import { Ref } from '../../ref/definition';

export interface ParamFieldDefinition<TField = unknown> {
  ref: Ref<TField>;

  description?: string;

  required?: boolean;

  deprecated?: boolean;

  meta: Record<string, unknown>;
}

export interface ParamsDefinition<TField = unknown> {
  fields: Record<string, ParamFieldDefinition<TField>>;

  description?: string;

  meta: Record<string, unknown>;
}
