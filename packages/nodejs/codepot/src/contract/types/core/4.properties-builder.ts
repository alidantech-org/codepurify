import type { DefinitionItem } from '@/contract/types/definition';

import type { PropertiesDefinition } from '@/contract/types/properties/definition';

import type {
  PrimitiveDefinition,
  PrimitiveFormat,
  PrimitiveType,
  PrimitiveValidationDefinition,
} from '@/contract/types/properties/primitive/definition';

import type { EnumDefinition, EnumValuePrimitive } from '@/contract/types/properties/enum/definition';

import type { CompositeDefinition } from '@/contract/types/properties/composite/definition';

import type {
  FieldAccessConfig,
  FieldAccessLevel,
  FieldPersistenceConfig,
  FieldPersistenceMode,
  FieldQueryConfig,
  QueryOperator,
} from '@/contract/types/schema/entity/field/definition';

import type {
  ArrayUsageOptions,
  CompositeAuthoringRef,
  EntityAuthoringRef,
  EntityFieldAuthoringRef,
  ModelAuthoringRef,
  PropertyAuthoringRef,
} from './3.authoring-ref';

// ============================================================================
// PROPERTY SOURCE INPUTS
// ============================================================================

export const PropertySourceKind = {
  primitive: 'primitive',
  enum: 'enum',
  composite: 'composite',
  ref: 'ref',
} as const;

export type PropertySourceKind = (typeof PropertySourceKind)[keyof typeof PropertySourceKind];

export interface BasePropertySourceInput extends DefinitionItem {
  readonly kind: PropertySourceKind;
}

/**
 * Codepot-native primitive source.
 * Helpers should produce static IR facts only.
 */
export interface PrimitivePropertySourceInput extends BasePropertySourceInput {
  readonly kind: 'primitive';
  readonly type: PrimitiveType;
  readonly format?: PrimitiveFormat;
  readonly example?: unknown;
  readonly validation?: PrimitiveValidationDefinition;
}

export interface EnumPropertyValueInput extends DefinitionItem {
  readonly value: EnumValuePrimitive;
  readonly label?: string;
}

export interface EnumPropertySourceInput extends BasePropertySourceInput {
  readonly kind: 'enum';

  readonly values: readonly EnumValuePrimitive[] | Record<string, EnumValuePrimitive | EnumPropertyValueInput>;
}

export interface CompositePropertySourceInput extends BasePropertySourceInput {
  readonly kind: 'composite';

  readonly extends?: CompositeAuthoringRef;

  readonly properties: Record<string, PropertySourceInput>;
}

export interface RefPropertySourceInput extends BasePropertySourceInput {
  readonly kind: 'ref';

  /**
   * Reference to a reusable primitive, enum, or composite property.
   */
  readonly ref: PropertyAuthoringRef;

  /**
   * Source-level overrides only.
   * Entity field options do not live here.
   */
  readonly overrides?: Partial<PrimitiveDefinition | EnumDefinition | CompositeDefinition>;
}

export type PropertySourceInput =
  | PrimitivePropertySourceInput
  | EnumPropertySourceInput
  | CompositePropertySourceInput
  | RefPropertySourceInput;

export type PropertySourceMap = Record<string, PropertySourceInput>;

// ============================================================================
// ENTITY FIELD INPUTS
// ============================================================================

export interface EntityFieldOptions extends DefinitionItem {
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly default?: unknown;
  readonly array?: true | ArrayUsageOptions;
  readonly query?: FieldQueryConfig;
  readonly access?: FieldAccessConfig;
  readonly persistence?: FieldPersistenceConfig;
}

export interface EntityFieldInput {
  readonly source: PropertySourceInput;

  /**
   * Only valid inside defineProperties().entity(...).
   */
  readonly options?: EntityFieldOptions;
}

export type EntityFieldInputMap = Record<string, EntityFieldInput>;

// ============================================================================
// QUERY OPTION BUILDERS
// ============================================================================

export interface QueryOperatorBuilder {
  eq(): QueryOperatorBuilder;
  neq(): QueryOperatorBuilder;
  in(): QueryOperatorBuilder;
  notIn(): QueryOperatorBuilder;
  contains(): QueryOperatorBuilder;
  startsWith(): QueryOperatorBuilder;
  endsWith(): QueryOperatorBuilder;
  gt(): QueryOperatorBuilder;
  gte(): QueryOperatorBuilder;
  lt(): QueryOperatorBuilder;
  lte(): QueryOperatorBuilder;
  between(): QueryOperatorBuilder;
  exists(): QueryOperatorBuilder;

  done(): QueryOperator[];
}

export interface QueryOptionsBuilder {
  filter(value?: boolean): QueryOptionsBuilder;
  sort(value?: boolean): QueryOptionsBuilder;
  select(value?: boolean): QueryOptionsBuilder;

  operators(build: (operator: QueryOperatorBuilder) => QueryOperatorBuilder): QueryOptionsBuilder;

  done(): FieldQueryConfig;
}

export interface QueryHelper {
  operators(): QueryOperatorBuilder;

  filter(value?: boolean): QueryOptionsBuilder;
  sort(value?: boolean): QueryOptionsBuilder;
  select(value?: boolean): QueryOptionsBuilder;

  options(config: FieldQueryConfig): FieldQueryConfig;
}

// ============================================================================
// ACCESS OPTION BUILDERS
// ============================================================================

export interface AccessOptionsBuilder {
  read(level: FieldAccessLevel): AccessOptionsBuilder;
  write(level: FieldAccessLevel): AccessOptionsBuilder;

  public(): AccessOptionsBuilder;
  internal(): AccessOptionsBuilder;
  secret(): AccessOptionsBuilder;
  auth(): AccessOptionsBuilder;

  sensitive(value?: boolean): AccessOptionsBuilder;

  done(): FieldAccessConfig;
}

export interface AccessHelper {
  read(level: FieldAccessLevel): AccessOptionsBuilder;
  write(level: FieldAccessLevel): AccessOptionsBuilder;

  public(): AccessOptionsBuilder;
  internal(): AccessOptionsBuilder;
  secret(): AccessOptionsBuilder;
  auth(): AccessOptionsBuilder;

  sensitive(value?: boolean): AccessOptionsBuilder;

  options(config: FieldAccessConfig): FieldAccessConfig;
}

// ============================================================================
// PERSISTENCE OPTION BUILDERS
// ============================================================================

export interface PersistenceOptionsBuilder {
  mode(mode: FieldPersistenceMode): PersistenceOptionsBuilder;

  stored(): PersistenceOptionsBuilder;
  virtual(): PersistenceOptionsBuilder;
  computed(): PersistenceOptionsBuilder;

  generated(value?: boolean): PersistenceOptionsBuilder;
  immutable(value?: boolean): PersistenceOptionsBuilder;

  done(): FieldPersistenceConfig;
}

export interface PersistenceHelper {
  mode(mode: FieldPersistenceMode): PersistenceOptionsBuilder;

  stored(): PersistenceOptionsBuilder;
  virtual(): PersistenceOptionsBuilder;
  computed(): PersistenceOptionsBuilder;

  generated(value?: boolean): PersistenceOptionsBuilder;
  immutable(value?: boolean): PersistenceOptionsBuilder;

  options(config: FieldPersistenceConfig): FieldPersistenceConfig;
}

// ============================================================================
// PROPERTY SOURCE BUILDERS
// ============================================================================

export interface PrimitivePropertyBuilder {
  readonly input: PrimitivePropertySourceInput;

  min(value: number): PrimitivePropertyBuilder;
  max(value: number): PrimitivePropertyBuilder;
  exclusiveMin(value: number): PrimitivePropertyBuilder;
  exclusiveMax(value: number): PrimitivePropertyBuilder;
  multipleOf(value: number): PrimitivePropertyBuilder;

  minLength(value: number): PrimitivePropertyBuilder;
  maxLength(value: number): PrimitivePropertyBuilder;
  pattern(value: string): PrimitivePropertyBuilder;

  format(value: PrimitiveFormat): PrimitivePropertyBuilder;

  example(value: unknown): PrimitivePropertyBuilder;
  description(value: string): PrimitivePropertyBuilder;
  deprecated(value?: boolean): PrimitivePropertyBuilder;
  meta(value: Record<string, unknown>): PrimitivePropertyBuilder;

  build(): PrimitivePropertySourceInput;
}

export interface StringPropertyBuilder extends PrimitivePropertyBuilder {
  email(): StringPropertyBuilder;
  uri(): StringPropertyBuilder;
  url(): StringPropertyBuilder;
  uuid(): StringPropertyBuilder;
  objectId(): StringPropertyBuilder;
  phone(): StringPropertyBuilder;
  password(): StringPropertyBuilder;
  date(): StringPropertyBuilder;
  dateTime(): StringPropertyBuilder;
  time(): StringPropertyBuilder;
}

export interface NumberPropertyBuilder extends PrimitivePropertyBuilder {
  int(): NumberPropertyBuilder;
}

export interface EnumPropertyBuilder {
  readonly input: EnumPropertySourceInput;

  description(value: string): EnumPropertyBuilder;
  deprecated(value?: boolean): EnumPropertyBuilder;
  meta(value: Record<string, unknown>): EnumPropertyBuilder;

  build(): EnumPropertySourceInput;
}

export interface CompositePropertyBuilder {
  readonly input: CompositePropertySourceInput;

  extends(ref: CompositeAuthoringRef): CompositePropertyBuilder;

  description(value: string): CompositePropertyBuilder;
  deprecated(value?: boolean): CompositePropertyBuilder;
  meta(value: Record<string, unknown>): CompositePropertyBuilder;

  build(): CompositePropertySourceInput;
}

export interface RefPropertyBuilder {
  readonly input: RefPropertySourceInput;

  description(value: string): RefPropertyBuilder;
  deprecated(value?: boolean): RefPropertyBuilder;
  meta(value: Record<string, unknown>): RefPropertyBuilder;

  build(): RefPropertySourceInput;
}

// ============================================================================
// PROPERTY HELPER
// ============================================================================

/**
 * Source-only helper.
 *
 * Valid in:
 * - shared(...)
 * - forRef(...)
 *
 * Does not accept entity field options.
 */
export interface PropertyHelper {
  primitive(type: PrimitiveType): PrimitivePropertyBuilder;

  string(): StringPropertyBuilder;
  number(): NumberPropertyBuilder;
  integer(): NumberPropertyBuilder;
  boolean(): PrimitivePropertyBuilder;

  date(): StringPropertyBuilder;
  dateTime(): StringPropertyBuilder;
  time(): StringPropertyBuilder;
  email(): StringPropertyBuilder;
  uri(): StringPropertyBuilder;
  url(): StringPropertyBuilder;
  uuid(): StringPropertyBuilder;
  objectId(): StringPropertyBuilder;
  phone(): StringPropertyBuilder;
  password(): StringPropertyBuilder;
  binary(): StringPropertyBuilder;

  enum(values: readonly EnumValuePrimitive[] | Record<string, EnumValuePrimitive | EnumPropertyValueInput>): EnumPropertyBuilder;

  composite(properties: Record<string, PropertySourceInput>): CompositePropertyBuilder;

  ref(ref: PropertyAuthoringRef): RefPropertyBuilder;
}

// ============================================================================
// FIELD HELPER
// ============================================================================

/**
 * Entity-only helper.
 *
 * Valid only in:
 * - entity(...)
 *
 * First argument creates or references property source.
 * Second argument contains entity field options.
 */
export interface FieldHelper {
  from(source: PropertySourceInput, options?: EntityFieldOptions): EntityFieldInput;

  primitive(type: PrimitiveType, options?: EntityFieldOptions): EntityFieldInput;

  string(options?: EntityFieldOptions): EntityFieldInput;
  number(options?: EntityFieldOptions): EntityFieldInput;
  integer(options?: EntityFieldOptions): EntityFieldInput;
  boolean(options?: EntityFieldOptions): EntityFieldInput;

  date(options?: EntityFieldOptions): EntityFieldInput;
  dateTime(options?: EntityFieldOptions): EntityFieldInput;
  time(options?: EntityFieldOptions): EntityFieldInput;
  email(options?: EntityFieldOptions): EntityFieldInput;
  uri(options?: EntityFieldOptions): EntityFieldInput;
  url(options?: EntityFieldOptions): EntityFieldInput;
  uuid(options?: EntityFieldOptions): EntityFieldInput;
  objectId(options?: EntityFieldOptions): EntityFieldInput;
  phone(options?: EntityFieldOptions): EntityFieldInput;
  password(options?: EntityFieldOptions): EntityFieldInput;
  binary(options?: EntityFieldOptions): EntityFieldInput;

  enum(
    values: readonly EnumValuePrimitive[] | Record<string, EnumValuePrimitive | EnumPropertyValueInput>,
    options?: EntityFieldOptions,
  ): EntityFieldInput;

  composite(properties: Record<string, PropertySourceInput>, options?: EntityFieldOptions): EntityFieldInput;

  ref(ref: PropertyAuthoringRef, options?: EntityFieldOptions): EntityFieldInput;
}

// ============================================================================
// DEFINE PROPERTIES BUILDER
// ============================================================================

export interface SharedPropertiesResult<TFields extends PropertySourceMap> {
  readonly fields: TFields;

  readonly ref: {
    readonly [K in keyof TFields & string]: PropertyAuthoringRef;
  };
}

export interface ForRefPropertiesResult<TFields extends PropertySourceMap> {
  readonly fields: TFields;

  readonly ref: {
    readonly [K in keyof TFields & string]: PropertyAuthoringRef;
  };
}

export interface EntityOptions extends DefinitionItem {
  readonly extends?: EntityAuthoringRef;
  readonly tags?: readonly string[];
}

export interface EntityModelRefs {
  readonly read: ModelAuthoringRef;
  readonly create: ModelAuthoringRef;
  readonly patch: ModelAuthoringRef;
  readonly query: ModelAuthoringRef;
  readonly projection: ModelAuthoringRef;
  readonly redacted: ModelAuthoringRef;
  readonly derived: ModelAuthoringRef;
  readonly internal: ModelAuthoringRef;
}

export interface EntityPropertiesResult<TName extends string, TFields extends EntityFieldInputMap> {
  readonly name: TName;

  readonly fields: TFields;

  readonly entity: EntityAuthoringRef;

  readonly ref: {
    readonly fields: {
      readonly [K in keyof TFields & string]: EntityFieldAuthoringRef;
    };

    readonly models: EntityModelRefs;
  };
}

export interface PropertiesBuilder {
  readonly state: Partial<PropertiesDefinition>;

  shared<TFields extends PropertySourceMap>(fields: TFields): SharedPropertiesResult<TFields>;

  forRef<TFields extends PropertySourceMap>(fields: TFields): ForRefPropertiesResult<TFields>;

  entity<TName extends string, TFields extends EntityFieldInputMap>(
    name: TName,
    fields: TFields,
    options?: EntityOptions,
  ): EntityPropertiesResult<TName, TFields>;

  snapshot(): Partial<PropertiesDefinition>;
}
