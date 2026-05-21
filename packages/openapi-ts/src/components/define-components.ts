import { EngineIdPart, createEngineId } from "../ids/engine-id.js";
import { RefKind } from "../refs/ref-kind.js";
import type { ComponentRef } from "../refs/ref.types.js";
import type { OptionalResourceContext } from "../resource/resource-context.types.js";
import { SdkKind, SdkPlacement } from "../sdk/sdk-extension.types.js";
import type {
  ComponentFieldMap,
  ComponentRegistry,
} from "./component.types.js";

export interface DefineComponentsOptions extends OptionalResourceContext {
  name: string;
}

export function defineComponents(
  options: DefineComponentsOptions,
  components: Record<string, ComponentFieldMap>,
): ComponentRegistry {
  const definitions = Object.entries(components).map(([name, fields]) => ({
    name,
    fields,
  }));

  const refs = Object.fromEntries(
    Object.keys(components).map((name) => [
      name,
      createComponentRef(options, name),
    ]),
  );

  return {
    name: options.name,
    definitions,
    ref: refs,
  };
}

function createComponentRef(
  options: DefineComponentsOptions,
  name: string,
): ComponentRef {
  const refId = createScopedId(options, EngineIdPart.component, name);

  return {
    id: refId,
    name,
    kind: RefKind.component,
    componentKey: name,
    meta: {
      kind: SdkKind.component,
      placement: getPlacement(options),
      group: options.resource?.group,
      resource: options.resource?.key,
      component: name,
      refId,
    },
  };
}

function createScopedId(
  options: DefineComponentsOptions,
  ...parts: string[]
): string {
  if (!options.resource) return createEngineId(...parts);

  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineComponentsOptions): SdkPlacement {
  return options.resource
    ? SdkPlacement.resourceLocal
    : SdkPlacement.globalShared;
}
