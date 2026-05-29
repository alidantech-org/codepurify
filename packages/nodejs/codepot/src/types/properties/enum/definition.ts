import { Ref } from '../../ref/definition';

export type EnumValuePrimitive = string | number;

export interface EnumValueDefinition {
  value: EnumValuePrimitive;

  label?: string;

  description?: string;

  deprecated?: boolean;

  metadata?: Record<string, unknown>;
}

export interface EnumDefinition<TResource = unknown, TEntity = unknown> {
  values: Record<string, EnumValueDefinition>;

  description?: string;

  resource?: Ref<TResource>;

  entity?: Ref<TEntity>;

  metadata?: Record<string, unknown>;
}
