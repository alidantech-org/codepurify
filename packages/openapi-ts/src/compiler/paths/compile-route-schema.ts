import type { ComponentFieldMap } from "../../components/component.types.js";
import { compileComponentSchema } from "../schemas/compile-component-schema.js";
import { compileModelSchema } from "../schemas/compile-model-schema.js";
import { resolvePendingRefs } from "../refs/resolve-pending-refs.js";
import type { RefResolver } from "../refs/ref-resolver.types.js";
import type { RouteSchemaRef } from "../../routes/route.types.js";
import { RefKind } from "../../refs/ref-kind.js";

export function compileRouteSchema(
  schema: RouteSchemaRef,
  resolver: RefResolver,
): unknown {
  if (isModelRef(schema)) {
    // @ts-expect-error
    return resolvePendingRefs(compileModelSchema(schema), resolver);
  }

  if (isComponentRef(schema)) {
    return resolvePendingRefs({ $ref: `#pending/${schema.id}` }, resolver);
  }

  return resolvePendingRefs(
    compileInlineSchema(schema as ComponentFieldMap),
    resolver,
  );
}

function compileInlineSchema(fields: ComponentFieldMap): unknown {
  return compileComponentSchema({
    name: "InlineRouteSchema",
    fields,
  });
}

function isModelRef(value: unknown): boolean {
  return isRefKind(value, RefKind.model);
}

function isComponentRef(value: unknown): boolean {
  return isRefKind(value, RefKind.component);
}

function isRefKind(value: unknown, kind: string): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    "kind" in value &&
    value.kind === kind
  );
}
