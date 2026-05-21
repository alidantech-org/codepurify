import type { RefKind } from "./ref-kind.js";
import type { SdkExtensionMeta } from "../sdk/sdk-extension.types.js";

export interface EngineRefBase {
  readonly id: string;
  readonly name: string;
  readonly kind: RefKind;
  readonly meta?: SdkExtensionMeta;
}

export interface PropertyRef extends EngineRefBase {
  readonly kind: typeof RefKind.property;
  readonly propertyKey: string;
}

export interface ComponentRef extends EngineRefBase {
  readonly kind: typeof RefKind.component;
  readonly componentKey: string;
}

export interface ModelRef extends EngineRefBase {
  readonly kind: typeof RefKind.model;
  readonly modelKey: string;
  readonly fields: Record<string, PropertyRef>;
}

export interface RouteRef extends EngineRefBase {
  readonly kind: typeof RefKind.route;
  readonly routeKey: string;
}

export interface OperationRef extends EngineRefBase {
  readonly kind: typeof RefKind.operation;
  readonly operationId: string;
}

export type EngineRef =
  | PropertyRef
  | ComponentRef
  | ModelRef
  | RouteRef
  | OperationRef;
