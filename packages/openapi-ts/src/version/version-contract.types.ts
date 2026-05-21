import type { SchemaComponentRegistry } from '../components/schemas/schema-component.types.js';
import type { ParameterComponentRegistry } from '../components/parameters/parameter-component.types.js';
import type { RequestBodyComponentRegistry } from '../components/request-bodies/request-body-component.types.js';
import type { ResponseComponentRegistry } from '../components/responses/response-component.types.js';
import type { ResponseRef } from '../refs/ref.types.js';
import type { PropertyRegistry } from '../properties/property.types.js';
import type { ResourceBuilder } from '../resource/define-resource.js';

export interface VersionLicense {
  readonly name: string;
  readonly identifier?: string;
  readonly url?: string;
}

export interface VersionInfo {
  title: string;
  version: string;
  description?: string;
  license?: VersionLicense;
}

export interface VersionContract {
  readonly info: VersionInfo;
  readonly resources: ResourceBuilder[];
  readonly properties: PropertyRegistry[];
  readonly schemaComponents: SchemaComponentRegistry[];
  readonly parameterComponents: ParameterComponentRegistry[];
  readonly requestBodyComponents: RequestBodyComponentRegistry[];
  readonly responseComponents: ResponseComponentRegistry[];
  readonly defaultResponses: Record<number, ResponseRef>;
}
