import { Ref } from '../../ref/definition';

export type EnumValuePrimitive = string | number;

export interface EnumValueDefinition {
  value: EnumValuePrimitive;

  label?: string;

  description?: string;

  deprecated?: boolean;

  meta: Record<string, unknown>;
}

export interface EnumDefinition<TResource = unknown, TEntity = unknown> {
  values: Record<string, EnumValueDefinition>;

  description?: string;

  resource?: Ref<TResource>;

  entity?: Ref<TEntity>;

  meta: Record<string, unknown>;
}
