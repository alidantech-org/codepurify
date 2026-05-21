import type { z } from "zod";
import { SchemaKind } from "./schema-kind.js";
import type { PropertyRef } from "../refs/ref.types.js";
import type { RefUsage } from "../refs/ref-usage.types.js";
import type { SchemaAccess } from "./schema-access.js";
import type { PrimitiveQueryOptions } from "./query-behavior.js";

export interface SchemaBehaviorOptions {
  readonly access?: SchemaAccess;
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly select?: boolean;
  readonly description?: string;
}

export interface PrimitiveSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.primitive;
  readonly zod: z.ZodTypeAny;
  readonly query?: false | PrimitiveQueryOptions;
}

export interface CompositeSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.composite;
  readonly fields: SchemaFieldMap;
}

export type SchemaField =
  | PrimitiveSchemaField
  | CompositeSchemaField
  | PropertyRef
  | RefUsage<PropertyRef>;

export type SchemaFieldMap = Record<string, SchemaField>;
