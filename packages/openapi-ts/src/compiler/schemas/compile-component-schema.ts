import type {
  ComponentDefinition,
  ComponentFieldMap,
  ComponentFieldValue,
} from "../../components/component.types.js";
import type { ComponentRef, PropertyRef } from "../../refs/ref.types.js";
import { RefKind } from "../../refs/ref-kind";
import { applySdkExtensions } from "../../sdk/apply-sdk-extensions";

export function compileComponentSchema(
  definition: ComponentDefinition,
  ref?: ComponentRef,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: "object",
    properties: compileComponentFields(definition.fields),
  };

  if (ref?.meta) {
    applySdkExtensions(schema, ref.meta);
  }

  return schema;
}

function compileComponentFields(
  fields: ComponentFieldMap,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      compileComponentFieldValue(value),
    ]),
  );
}

function compileComponentFieldValue(value: ComponentFieldValue): unknown {
  if (isPropertyRef(value) || isComponentRef(value)) {
    return { $ref: `#pending/${value.id}` };
  }

  return {
    type: "object",
    properties: compileComponentFields(value),
  };
}

function isPropertyRef(value: unknown): value is PropertyRef {
  return isRefKind(value, RefKind.property);
}

function isComponentRef(value: unknown): value is ComponentRef {
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
