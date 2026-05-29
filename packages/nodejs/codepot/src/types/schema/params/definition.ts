import { Ref } from '../../ref/definition';

export interface ParamFieldDefinition<TField = unknown> {
  ref: Ref<TField>;

  description?: string;

  required?: boolean;

  deprecated?: boolean;

  metadata?: Record<string, unknown>;
}

export interface ParamsDefinition<TField = unknown> {
  fields: Record<string, ParamFieldDefinition<TField>>;

  description?: string;

  metadata?: Record<string, unknown>;
}
