// ─── tempurify/fields/factories.ts ─────────────────────────────────────────────────

import {
  StringFieldConfig,
  BooleanFieldConfig,
  EnumFieldConfig,
  UuidFieldConfig,
  ForeignFieldConfig,
  SecurityConfig,
  FieldConfig,
  EqRule,
  NeqRule,
  EmptyRule,
  NotEmptyRule,
  InRule,
  NotInRule,
  RegexRule,
  GtRule,
  GteRule,
  LtRule,
  LteRule,
  IsNullRule,
  IsNotNullRule,
  FieldOperand,
  RuleValue,
  Primitive,
  CheckRule,
  NotRule,
  AndRule,
  OrRule,
  RelationFieldConfig,
  RelationConfigUnion,
  IEntityConfig,
  EntityConfigClass,
  EntityInstance,
} from '../types';

// ─── Field Rule Helpers ─────────────────────────────────────────────────────────

export function ref(fieldRef: () => any): FieldOperand {
  return {
    field: fieldRef,
  };
}

export function field(fieldRef: () => any) {
  return {
    eq(value: RuleValue): EqRule {
      return { type: 'eq', field: { field: fieldRef }, value };
    },
    neq(value: RuleValue): NeqRule {
      return { type: 'neq', field: { field: fieldRef }, value };
    },
    empty(): EmptyRule {
      return { type: 'empty', field: { field: fieldRef } };
    },
    notEmpty(): NotEmptyRule {
      return { type: 'notEmpty', field: { field: fieldRef } };
    },
    in(values: readonly (string | number | boolean)[]): InRule {
      return { type: 'in', field: { field: fieldRef }, values };
    },
    notIn(values: readonly (string | number | boolean)[]): NotInRule {
      return { type: 'notIn', field: { field: fieldRef }, values };
    },
    regex(pattern: string): RegexRule {
      return { type: 'regex', field: { field: fieldRef }, pattern };
    },
    gt(value: RuleValue): GtRule {
      return { type: 'gt', field: { field: fieldRef }, value };
    },
    gte(value: RuleValue): GteRule {
      return { type: 'gte', field: { field: fieldRef }, value };
    },
    lt(value: RuleValue): LtRule {
      return { type: 'lt', field: { field: fieldRef }, value };
    },
    lte(value: RuleValue): LteRule {
      return { type: 'lte', field: { field: fieldRef }, value };
    },
    isNull(): IsNullRule {
      return { type: 'isNull', field: { field: fieldRef } };
    },
    isNotNull(): IsNotNullRule {
      return { type: 'isNotNull', field: { field: fieldRef } };
    },
  };
}

// ─── Logical Helpers ─────────────────────────────────────────────────────────────

export function not(rule: CheckRule): NotRule {
  return { type: 'not', rule };
}

export function and(...rules: CheckRule[]): AndRule {
  return { type: 'and', rules };
}

export function or(...rules: CheckRule[]): OrRule {
  return { type: 'or', rules };
}

// ─── Query rule assertion ───────────────────────────────────────────────────────

function assertQueryRules(query?: any, security?: SecurityConfig): void {
  // Implementation would validate query and security configurations
  // This is a placeholder for actual validation logic
}

// ─── Field factories ──────────────────────────────────────────────────────────

export function stringField(config: Omit<StringFieldConfig, 'kind'>): StringFieldConfig {
  assertQueryRules(config.query, config.security);
  return {
    kind: 'string',
    ...config,
  };
}

export function booleanField(config: Omit<BooleanFieldConfig, 'kind'>): BooleanFieldConfig {
  assertQueryRules(config.query, config.security);
  return {
    kind: 'boolean',
    ...config,
  };
}

export function enumField<const T extends readonly string[]>(
  values: T,
  config: Omit<EnumFieldConfig<T[number]>, 'kind' | 'value_list' | 'values'> = {},
): EnumFieldConfig<T[number]> {
  assertQueryRules(config.query, config.security);

  // Helper function to create typed enum value map
  type EnumValueMap<T extends readonly string[]> = {
    readonly [K in T[number]]: K;
  };

  function makeEnumValueMap<const T extends readonly string[]>(values: T): EnumValueMap<T> {
    return Object.fromEntries(values.map((value) => [value, value])) as EnumValueMap<T>;
  }

  return {
    kind: 'enum',
    value_list: values,
    values: makeEnumValueMap(values),
    ...config,
  } as const;
}

export function uuidField(config: Omit<UuidFieldConfig, 'kind'>): UuidFieldConfig {
  assertQueryRules(config.query, config.security);
  return {
    kind: 'uuid',
    ...config,
  };
}

// ─── Foreign Field Factory ─────────────────────────────────────────────────────

export function foreignField<T extends IEntityConfig>(remoteConfig: T, config: Omit<ForeignFieldConfig, 'kind'>): ForeignFieldConfig {
  return {
    kind: 'foreign',
    ...config,
  };
}

// ─── Relation Field Factory ─────────────────────────────────────────────────────

export function relationField(
  localEntity: IEntityConfig,
  remoteEntity: EntityConfigClass,
  config: RelationFieldConfig,
): RelationConfigUnion {
  return config.relation;
}
