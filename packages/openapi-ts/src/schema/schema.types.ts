import type { z } from "zod";
import { SchemaKind } from "./schema-kind";
import type { PropertyRef } from "../refs/ref.types.js";

export type SchemaAccess = "public" | "internal" | "private";

export interface PrimitiveSchemaField {
  readonly kind: typeof SchemaKind.primitive;
  readonly zod: z.ZodTypeAny;
  readonly access?: SchemaAccess;
  readonly description?: string;
}

export interface CompositeSchemaField {
  readonly kind: typeof SchemaKind.composite;
  readonly fields: SchemaFieldMap;
  readonly access?: SchemaAccess;
  readonly description?: string;
}

export type SchemaField =
  | PrimitiveSchemaField
  | CompositeSchemaField
  | PropertyRef;

export type SchemaFieldMap = Record<string, SchemaField>;
