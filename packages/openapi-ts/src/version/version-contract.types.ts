import type { ComponentRegistry } from "../components/component.types.js";
import type { PropertyRegistry } from "../properties/property.types.js";
import type { ResourceBuilder } from "../resource/define-resource";

export interface VersionInfo {
  title: string;
  version: string;
  description?: string;
}

export interface VersionContract {
  readonly info: VersionInfo;
  readonly resources: ResourceBuilder[];
  readonly properties: PropertyRegistry[];
  readonly components: ComponentRegistry[];
}
