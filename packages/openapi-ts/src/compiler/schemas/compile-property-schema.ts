import { SchemaKind } from "../../schema/schema-kind.js";
import type {
  CompositeSchemaField,
  PrimitiveSchemaField,
  SchemaField,
} from "../../schema/schema.types.js";
import type { PropertyRef } from "../../refs/ref.types.js";
import {
  zodToOpenApiSchema,
  type ZodSchemaMode,
} from "./zod-to-openapi-schema.js";

export function compilePropertySchema(
  field: SchemaField,
  mode: ZodSchemaMode = "output",
): unknown {
  if (isPropertyRef(field)) {
    return {
      $ref: `#pending/${field.id}`,
    };
  }

  if (field.kind === SchemaKind.primitive) {
    return compilePrimitive(field, mode);
  }

  return compileComposite(field, mode);
}

function compilePrimitive(
  field: PrimitiveSchemaField,
  mode: ZodSchemaMode,
): unknown {
  return {
    ...asObject(zodToOpenApiSchema(field.zod, mode)),
    description: field.description,
  };
}

function compileComposite(
  field: CompositeSchemaField,
  mode: ZodSchemaMode,
): unknown {
  return {
    type: "object",
    description: field.description,
    properties: Object.fromEntries(
      Object.entries(field.fields).map(([key, value]) => [
        key,
        compilePropertySchema(value, mode),
      ]),
    ),
  };
}

function isPropertyRef(value: unknown): value is PropertyRef {
  return (
    !!value &&
    typeof value === "object" &&
    "propertyKey" in value &&
    "id" in value
  );
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}
