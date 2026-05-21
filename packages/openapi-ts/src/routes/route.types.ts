import type { ComponentRef, ModelRef } from "../refs/ref.types.js";
import type { ComponentFieldMap } from "../components/component.types.js";
import type { HttpMethod } from "./http-method";
import type { SdkExtensionMeta } from "../sdk/sdk-extension.types.js";

export type RouteSchemaRef = ComponentRef | ModelRef | ComponentFieldMap;

export interface RouteDefinition {
  readonly method: HttpMethod;
  readonly path: string;
  readonly summary?: string;
  readonly description?: string;

  readonly params?: RouteSchemaRef;
  readonly query?: RouteSchemaRef;
  readonly body?: RouteSchemaRef;

  readonly response?: RouteSchemaRef;
  readonly responses?: Record<number, RouteSchemaRef>;

  readonly operationId?: string;
  readonly tags?: string[];
  readonly meta?: SdkExtensionMeta;
}

export interface RouteRegistry {
  readonly name: string;
  readonly routes: Record<string, RouteDefinition>;
}
