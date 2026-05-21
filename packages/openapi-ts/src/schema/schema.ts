import type { z } from "zod";
import { SchemaKind } from "./schema-kind.js";
import type {
  CompositeSchemaField,
  PrimitiveSchemaField,
  SchemaBehaviorOptions,
  SchemaFieldMap,
} from "./schema.types.js";
import type { PrimitiveQueryOptions } from "./query-behavior.js";

export interface PrimitiveOptions extends SchemaBehaviorOptions {
  query?: false | PrimitiveQueryOptions;
}

export interface CompositeOptions extends SchemaBehaviorOptions {}

export const schema = {
  primitive(
    zod: z.ZodTypeAny,
    options: PrimitiveOptions = {},
  ): PrimitiveSchemaField {
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

  composite(
    fields: SchemaFieldMap,
    options: CompositeOptions = {},
  ): CompositeSchemaField {
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
} as const;
