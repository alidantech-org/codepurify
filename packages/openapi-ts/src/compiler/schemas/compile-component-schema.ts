import type {
  ComponentDefinition,
  ComponentFieldMap,
  ComponentFieldValue,
} from "../../components/component.types.js";
import type { ComponentRef, PropertyRef } from "../../refs/ref.types.js";
import { isRefUsage } from "../../validation/ref-usage-guards.js";
import { RefKind } from "../../refs/ref-kind.js";
import { applySdkExtensions } from "../../sdk/apply-sdk-extensions.js";

export function compileComponentSchema(
  definition: ComponentDefinition,
  ref?: ComponentRef,
): Record<string, unknown> {
  const required = getRequiredKeys(definition.fields);

  const schema: Record<string, unknown> = {
    type: "object",
    properties: compileComponentFields(definition.fields),
  };

  if (required.length > 0) {
    schema.required = required;
  }

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
  if (isRefUsage(value)) {
    return applyNullable({ $ref: `#pending/${value.ref.id}` }, value.nullable);
  }

  if (isPropertyRef(value) || isComponentRef(value)) {
    return { $ref: `#pending/${value.id}` };
  }

  return {
    type: "object",
    properties: compileComponentFields(value),
    required: getRequiredKeys(value),
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

function getRequiredKeys(fields: ComponentFieldMap): string[] {
  return Object.entries(fields)
    .filter(([, value]) => isRequired(value))
    .map(([key]) => key);
}

function isRequired(value: ComponentFieldValue): boolean {
  if (isRefUsage(value) && value.required !== undefined) {
    return value.required;
  }

  return true;
}

function applyNullable(
  schema: unknown,
  nullable: boolean | undefined,
): unknown {
  if (!nullable) return schema;

  return {
    anyOf: [schema, { type: "null" }],
  };
}
