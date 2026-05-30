import {
  FieldAccessLevel,
  FieldPersistenceMode,
  QueryOperator,
  type FieldPersistenceConfig,
} from '@/contract/types/schema/entity/field/definition';

import { PrimitiveFormat, PrimitiveType } from '@/contract/types/properties/primitive/definition';

import type { EnumValuePrimitive } from '@/contract/types/properties/enum/definition';

import type {
  AccessOptionsBuilder,
  AccessHelper,
  CompositePropertyBuilder,
  CompositePropertySourceInput,
  EntityFieldInput,
  EntityFieldOptions,
  EnumPropertyBuilder,
  EnumPropertySourceInput,
  EnumPropertyValueInput,
  FieldHelper,
  NumberPropertyBuilder,
  PersistenceHelper,
  PersistenceOptionsBuilder,
  PrimitivePropertyBuilder,
  PrimitivePropertySourceInput,
  PropertyHelper,
  PropertySourceInput,
  QueryHelper,
  QueryOperatorBuilder,
  QueryOptionsBuilder,
  RefPropertyBuilder,
  RefPropertySourceInput,
  StringPropertyBuilder,
} from '@/contract/types/core/4.properties-builder';

import type { CompositeAuthoringRef, PropertyAuthoringRef } from '@/contract/types/core/3.authoring-ref';

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function primitiveInput(type: PrimitiveType, format?: PrimitiveFormat): PrimitivePropertySourceInput {
  return {
    kind: 'primitive',
    type,
    format,
  };
}

function patchPrimitive(input: PrimitivePropertySourceInput, patch: Partial<PrimitivePropertySourceInput>): PrimitivePropertySourceInput {
  return {
    ...input,
    ...patch,
    validation: {
      ...(input.validation ?? {}),
      ...(patch.validation ?? {}),
    },
  };
}

function primitiveBuilder(input: PrimitivePropertySourceInput): PrimitivePropertyBuilder {
  return {
    input,

    min(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { minimum: value },
        }),
      );
    },

    max(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { maximum: value },
        }),
      );
    },

    exclusiveMin(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { exclusiveMinimum: value },
        }),
      );
    },

    exclusiveMax(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { exclusiveMaximum: value },
        }),
      );
    },

    multipleOf(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { multipleOf: value },
        }),
      );
    },

    minLength(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { minLength: value },
        }),
      );
    },

    maxLength(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { maxLength: value },
        }),
      );
    },

    pattern(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          validation: { pattern: value },
        }),
      );
    },

    format(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          format: value,
        }),
      );
    },

    example(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          example: value,
        }),
      );
    },

    description(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          description: value,
        }),
      );
    },

    deprecated(value = true) {
      return primitiveBuilder(
        patchPrimitive(input, {
          deprecated: value,
        }),
      );
    },

    meta(value) {
      return primitiveBuilder(
        patchPrimitive(input, {
          meta: value,
        }),
      );
    },

    build() {
      return input;
    },
  };
}

function stringBuilder(input: PrimitivePropertySourceInput): StringPropertyBuilder {
  const base = primitiveBuilder(input);

  return {
    ...base,

    email() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.email }));
    },

    uri() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.uri }));
    },

    url() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.url }));
    },

    uuid() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.uuid }));
    },

    objectId() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.objectId }));
    },

    phone() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.phone }));
    },

    password() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.password }));
    },

    date() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.date }));
    },

    dateTime() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.dateTime }));
    },

    time() {
      return stringBuilder(patchPrimitive(input, { format: PrimitiveFormat.time }));
    },
  };
}

function numberBuilder(input: PrimitivePropertySourceInput): NumberPropertyBuilder {
  const base = primitiveBuilder(input);

  return {
    ...base,

    int() {
      return numberBuilder(
        patchPrimitive(input, {
          type: PrimitiveType.integer,
        }),
      );
    },
  };
}

function normalizeEnumValues(
  values: readonly EnumValuePrimitive[] | Record<string, EnumValuePrimitive | EnumPropertyValueInput>,
): EnumPropertySourceInput['values'] {
  return values;
}

function enumBuilder(input: EnumPropertySourceInput): EnumPropertyBuilder {
  return {
    input,

    description(value) {
      return enumBuilder({ ...input, description: value });
    },

    deprecated(value = true) {
      return enumBuilder({ ...input, deprecated: value });
    },

    meta(value) {
      return enumBuilder({ ...input, meta: value });
    },

    build() {
      return input;
    },
  };
}

function compositeBuilder(input: CompositePropertySourceInput): CompositePropertyBuilder {
  return {
    input,

    extends(ref: CompositeAuthoringRef) {
      return compositeBuilder({ ...input, extends: ref });
    },

    description(value) {
      return compositeBuilder({ ...input, description: value });
    },

    deprecated(value = true) {
      return compositeBuilder({ ...input, deprecated: value });
    },

    meta(value) {
      return compositeBuilder({ ...input, meta: value });
    },

    build() {
      return input;
    },
  };
}

function refBuilder(input: RefPropertySourceInput): RefPropertyBuilder {
  return {
    input,

    description(value) {
      return refBuilder({ ...input, description: value });
    },

    deprecated(value = true) {
      return refBuilder({ ...input, deprecated: value });
    },

    meta(value) {
      return refBuilder({ ...input, meta: value });
    },

    build() {
      return input;
    },
  };
}

type PropertySourceBuilderLike = {
  build(): PropertySourceInput;
};

function isPropertySourceBuilderLike(input: PropertySourceInput | PropertySourceBuilderLike): input is PropertySourceBuilderLike {
  return typeof (input as PropertySourceBuilderLike).build === 'function';
}

function asSource(input: PropertySourceInput | PropertySourceBuilderLike): PropertySourceInput {
  if (isPropertySourceBuilderLike(input)) {
    return input.build();
  }

  return input;
}

// ============================================================================
// PROPERTY HELPER
// ============================================================================

export const property: PropertyHelper = {
  primitive(type) {
    return primitiveBuilder(primitiveInput(type));
  },

  string() {
    return stringBuilder(primitiveInput(PrimitiveType.string));
  },

  number() {
    return numberBuilder(primitiveInput(PrimitiveType.number));
  },

  integer() {
    return numberBuilder(primitiveInput(PrimitiveType.integer));
  },

  boolean() {
    return primitiveBuilder(primitiveInput(PrimitiveType.boolean));
  },

  date() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.date));
  },

  dateTime() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.dateTime));
  },

  time() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.time));
  },

  email() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.email));
  },

  uri() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.uri));
  },

  url() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.url));
  },

  uuid() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.uuid));
  },

  objectId() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.objectId));
  },

  phone() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.phone));
  },

  password() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.password));
  },

  binary() {
    return stringBuilder(primitiveInput(PrimitiveType.string, PrimitiveFormat.binary));
  },

  enum(values) {
    return enumBuilder({
      kind: 'enum',
      values: normalizeEnumValues(values),
    });
  },

  composite(properties) {
    return compositeBuilder({
      kind: 'composite',
      properties,
    });
  },

  ref(ref: PropertyAuthoringRef) {
    return refBuilder({
      kind: 'ref',
      ref,
    });
  },
};

// ============================================================================
// FIELD HELPER
// ============================================================================

function fieldFrom(source: PropertySourceInput, options?: EntityFieldOptions): EntityFieldInput {
  return {
    source,
    options,
  };
}

export const field: FieldHelper = {
  from(source, options) {
    return fieldFrom(asSource(source), options);
  },

  primitive(type, options) {
    return fieldFrom(property.primitive(type).build(), options);
  },

  string(options) {
    return fieldFrom(property.string().build(), options);
  },

  number(options) {
    return fieldFrom(property.number().build(), options);
  },

  integer(options) {
    return fieldFrom(property.integer().build(), options);
  },

  boolean(options) {
    return fieldFrom(property.boolean().build(), options);
  },

  date(options) {
    return fieldFrom(property.date().build(), options);
  },

  dateTime(options) {
    return fieldFrom(property.dateTime().build(), options);
  },

  time(options) {
    return fieldFrom(property.time().build(), options);
  },

  email(options) {
    return fieldFrom(property.email().build(), options);
  },

  uri(options) {
    return fieldFrom(property.uri().build(), options);
  },

  url(options) {
    return fieldFrom(property.url().build(), options);
  },

  uuid(options) {
    return fieldFrom(property.uuid().build(), options);
  },

  objectId(options) {
    return fieldFrom(property.objectId().build(), options);
  },

  phone(options) {
    return fieldFrom(property.phone().build(), options);
  },

  password(options) {
    return fieldFrom(property.password().build(), options);
  },

  binary(options) {
    return fieldFrom(property.binary().build(), options);
  },

  enum(values, options) {
    return fieldFrom(property.enum(values).build(), options);
  },

  composite(properties, options) {
    return fieldFrom(property.composite(properties).build(), options);
  },

  ref(ref, options) {
    return fieldFrom(property.ref(ref).build(), options);
  },
};

// ============================================================================
// QUERY HELPER
// ============================================================================

function queryOperatorBuilder(values: QueryOperator[] = []): QueryOperatorBuilder {
  const add = (value: QueryOperator) => queryOperatorBuilder([...values, value]);

  return {
    eq: () => add(QueryOperator.eq),
    neq: () => add(QueryOperator.neq),
    in: () => add(QueryOperator.in),
    notIn: () => add(QueryOperator.notIn),
    contains: () => add(QueryOperator.contains),
    startsWith: () => add(QueryOperator.startsWith),
    endsWith: () => add(QueryOperator.endsWith),
    gt: () => add(QueryOperator.gt),
    gte: () => add(QueryOperator.gte),
    lt: () => add(QueryOperator.lt),
    lte: () => add(QueryOperator.lte),
    between: () => add(QueryOperator.between),
    exists: () => add(QueryOperator.exists),

    done: () => values,
  };
}

function queryOptionsBuilder(config = {}): QueryOptionsBuilder {
  return {
    filter(value = true) {
      return queryOptionsBuilder({ ...config, filter: value });
    },

    sort(value = true) {
      return queryOptionsBuilder({ ...config, sort: value });
    },

    select(value = true) {
      return queryOptionsBuilder({ ...config, select: value });
    },

    operators(build) {
      return queryOptionsBuilder({
        ...config,
        operators: build(queryOperatorBuilder()).done(),
      });
    },

    done() {
      return config;
    },
  };
}

export const query: QueryHelper = {
  operators() {
    return queryOperatorBuilder();
  },

  filter(value = true) {
    return queryOptionsBuilder().filter(value);
  },

  sort(value = true) {
    return queryOptionsBuilder().sort(value);
  },

  select(value = true) {
    return queryOptionsBuilder().select(value);
  },

  options(config) {
    return config;
  },
};

// ============================================================================
// ACCESS HELPER
// ============================================================================

function accessOptionsBuilder(config = {}): AccessOptionsBuilder {
  return {
    read(level) {
      return accessOptionsBuilder({ ...config, read: level });
    },

    write(level) {
      return accessOptionsBuilder({ ...config, write: level });
    },

    public() {
      return accessOptionsBuilder({ ...config, read: FieldAccessLevel.public });
    },

    internal() {
      return accessOptionsBuilder({ ...config, read: FieldAccessLevel.internal });
    },

    secret() {
      return accessOptionsBuilder({
        ...config,
        read: FieldAccessLevel.secret,
        sensitive: true,
      });
    },

    auth() {
      return accessOptionsBuilder({ ...config, read: FieldAccessLevel.auth });
    },

    sensitive(value = true) {
      return accessOptionsBuilder({ ...config, sensitive: value });
    },

    done() {
      return config;
    },
  };
}

export const access: AccessHelper = {
  read(level) {
    return accessOptionsBuilder().read(level);
  },

  write(level) {
    return accessOptionsBuilder().write(level);
  },

  public() {
    return accessOptionsBuilder().public();
  },

  internal() {
    return accessOptionsBuilder().internal();
  },

  secret() {
    return accessOptionsBuilder().secret();
  },

  auth() {
    return accessOptionsBuilder().auth();
  },

  sensitive(value = true) {
    return accessOptionsBuilder().sensitive(value);
  },

  options(config) {
    return config;
  },
};

// ============================================================================
// PERSISTENCE HELPER
// ============================================================================

function persistenceOptionsBuilder(
  config: FieldPersistenceConfig = {
    mode: FieldPersistenceMode.stored,
  },
): PersistenceOptionsBuilder {
  return {
    mode(mode) {
      return persistenceOptionsBuilder({ ...config, mode });
    },

    stored() {
      return persistenceOptionsBuilder({ ...config, mode: FieldPersistenceMode.stored });
    },

    virtual() {
      return persistenceOptionsBuilder({ ...config, mode: FieldPersistenceMode.virtual });
    },

    computed() {
      return persistenceOptionsBuilder({ ...config, mode: FieldPersistenceMode.computed });
    },

    generated(value = true) {
      return persistenceOptionsBuilder({ ...config, generated: value });
    },

    immutable(value = true) {
      return persistenceOptionsBuilder({ ...config, immutable: value });
    },

    done() {
      return config;
    },
  };
}

export const persistence: PersistenceHelper = {
  mode(mode) {
    return persistenceOptionsBuilder().mode(mode);
  },

  stored() {
    return persistenceOptionsBuilder().stored();
  },

  virtual() {
    return persistenceOptionsBuilder().virtual();
  },

  computed() {
    return persistenceOptionsBuilder().computed();
  },

  generated(value = true) {
    return persistenceOptionsBuilder().generated(value);
  },

  immutable(value = true) {
    return persistenceOptionsBuilder().immutable(value);
  },

  options(config) {
    return config;
  },
};
