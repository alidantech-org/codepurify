import type { ComponentFieldMap } from "../../components/component.types.js";
import type { RouteSchemaRef } from "../../routes/route.types.js";
import type { RefResolver } from "../refs/ref-resolver.types.js";
import { compileRouteSchema } from "./compile-route-schema";

export function compileRouteParameters(
  schema: RouteSchemaRef | undefined,
  location: "path" | "query",
  resolver: RefResolver,
): unknown[] {
  if (!schema) return [];

  const compiled = compileRouteSchema(schema, resolver);

  if (!isOpenApiObjectSchema(compiled)) return [];

  return Object.entries(compiled.properties ?? {}).map(([name, property]) => ({
    name,
    in: location,
    required: location === "path",
    schema: property,
  }));
}

function isOpenApiObjectSchema(
  value: unknown,
): value is { properties?: ComponentFieldMap } {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
