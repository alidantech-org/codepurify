import type { ModelRef } from "../../refs/ref.types.js";
import { applySdkExtensions } from "../../sdk/apply-sdk-extensions";

export function compileModelSchema(ref: ModelRef): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: "object",
    properties: Object.fromEntries(
      Object.entries(ref.fields).map(([key, fieldRef]) => [
        key,
        { $ref: `#pending/${fieldRef.id}` },
      ]),
    ),
  };

  if (ref.meta) {
    applySdkExtensions(schema, ref.meta);
  }

  return schema;
}
