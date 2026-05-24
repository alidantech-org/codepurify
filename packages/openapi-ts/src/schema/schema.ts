import type { z } from 'zod';
import { SchemaKind } from './schema-kind.js';
import type {
  AnyOfSchemaField,
  CompositeSchemaField,
  FileSchemaField,
  LiteralSchemaField,
  NoContentSchemaField,
  OneOfSchemaField,
  PrimitiveSchemaField,
  RecordSchemaField,
  RefSchemaField,
  SchemaBehaviorOptions,
  SchemaField,
  SchemaFieldMap,
} from './schema.types.js';
import type { PrimitiveQueryOptions } from './query-behavior.js';
import type { ComponentRef, ModelRef, PropertyRef } from '../refs/ref.types.js';
import type { RefUsage } from '../refs/ref-usage.types.js';

export interface PrimitiveOptions extends SchemaBehaviorOptions {
  query?: false | PrimitiveQueryOptions;
  sensitive?: boolean;
}

export interface CompositeOptions extends SchemaBehaviorOptions {}

export const schema = {
  primitive(zod: z.ZodTypeAny, options: PrimitiveOptions = {}): PrimitiveSchemaField {
    return {
      kind: SchemaKind.primitive,
      zod,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      query: options.query,
      description: options.description,
    };
  },

  composite(fields: SchemaFieldMap, options: CompositeOptions = {}): CompositeSchemaField {
    return {
      kind: SchemaKind.composite,
      fields,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  ref(
    ref: PropertyRef | ModelRef | ComponentRef | RefUsage<PropertyRef> | RefUsage<ModelRef> | RefUsage<ComponentRef>,
    options: SchemaBehaviorOptions = {},
  ): RefSchemaField {
    return {
      kind: SchemaKind.ref,
      ref,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  record(value: SchemaField, options: SchemaBehaviorOptions = {}): RecordSchemaField {
    return {
      kind: SchemaKind.record,
      value,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  literal(value: string | number | boolean | null, options: SchemaBehaviorOptions = {}): LiteralSchemaField {
    return {
      kind: SchemaKind.literal,
      value,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  oneOf(values: SchemaField[], options: SchemaBehaviorOptions = {}): OneOfSchemaField {
    return {
      kind: SchemaKind.oneOf,
      values,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  anyOf(values: SchemaField[], options: SchemaBehaviorOptions = {}): AnyOfSchemaField {
    return {
      kind: SchemaKind.anyOf,
      values,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  file(options: SchemaBehaviorOptions = {}): FileSchemaField {
    return {
      kind: SchemaKind.file,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },

  noContent(options: SchemaBehaviorOptions = {}): NoContentSchemaField {
    return {
      kind: SchemaKind.noContent,
      access: options.access,
      required: options.required,
      nullable: options.nullable,
      select: options.select,
      description: options.description,
    };
  },
} as const;
