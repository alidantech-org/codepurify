import type { PropertyRegistry } from '../properties/property.types';
import type { ResourceBuilder } from '../resource/define-resource';
import type { RouteResponseInput } from '../routes/route.types';
import type { DeepPartial, ModelEmissionInput } from '../config/model-emission-defaults';
import type { QueryModelOptions } from '../config/query-model-defaults';
import { ParameterComponentRegistry } from '@/pipeline/targets/openapi/components/parameters/parameter-component.types';
import { RequestBodyComponentRegistry } from '@/pipeline/targets/openapi/components/request-bodies/request-body-component.types';
import { ResponseComponentRegistry } from '@/pipeline/targets/openapi/components/responses/response-component.types';
import { SchemaComponentRegistry } from '@/contract/schema/schemas/schema-component.types';
import { ContentTypeInput } from '@/pipeline/targets/openapi/options/content-type';

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

export interface VersionDefaults {
  readonly requestContentType?: ContentTypeInput;
  readonly responseContentType?: ContentTypeInput;
}

export interface VersionContract {
  readonly info: VersionInfo;
  readonly defaults: VersionDefaults;
  readonly resources: ResourceBuilder[];
  readonly properties: PropertyRegistry[];
  readonly schemaComponents: SchemaComponentRegistry[];
  readonly parameterComponents: ParameterComponentRegistry[];
  readonly requestBodyComponents: RequestBodyComponentRegistry[];
  readonly responseComponents: ResponseComponentRegistry[];
  readonly defaultResponses: Record<number, RouteResponseInput>;
  readonly modelEmission?: ModelEmissionInput;
  readonly queryModels?: DeepPartial<QueryModelOptions>;
}
