import type { z } from "zod";
import { SchemaKind } from "./schema-kind.js";
import type {
  CompositeSchemaField,
  PrimitiveSchemaField,
  SchemaAccess,
  SchemaFieldMap,
} from "./schema.types.js";

export interface PrimitiveOptions {
  access?: SchemaAccess;
  description?: string;
}

export interface CompositeOptions {
  access?: SchemaAccess;
  description?: string;
}

export const schema = {
  primitive(
    zod: z.ZodTypeAny,
    options: PrimitiveOptions = {},
  ): PrimitiveSchemaField {
    return {
      kind: SchemaKind.primitive,
      zod,
      access: options.access,
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
      description: options.description,
    };
  },
} as const;
