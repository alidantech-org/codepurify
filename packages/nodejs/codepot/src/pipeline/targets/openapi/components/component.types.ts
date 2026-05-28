import { RefWithUsageMethods } from "@/contract/refs/ref-usage.types";
import { ComponentRef } from "@/contract/refs/ref.types";
import { SchemaCompositionFieldValue, SchemaCompositionFieldMap } from "@/contract/schema/schema.types";


export type ComponentFieldValue = SchemaCompositionFieldValue;

export type ComponentFieldMap = SchemaCompositionFieldMap;

export type { SchemaCompositionFieldValue };

export type ComponentRefMap<TInput, TRef> = {
  readonly [Key in keyof TInput & string]: TRef;
};

export type SchemaComponentRefMap<TInput> = {
  readonly [Key in keyof TInput & string]: RefWithUsageMethods<ComponentRef>;
};
