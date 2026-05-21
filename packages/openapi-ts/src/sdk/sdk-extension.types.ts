export const SdkScope = {
  version: 'version',
  resource: 'resource',
  shared: 'shared',
} as const;

export type SdkScope = (typeof SdkScope)[keyof typeof SdkScope];

export const SdkKind = {
  primitive: 'primitive',
  enum: 'enum',
  property: 'property',
  composite: 'composite',
  model: 'model',
  dto: 'dto',
  component: 'component',
  parameter: 'parameter',
  requestBody: 'request-body',
  response: 'response',
  operation: 'operation',
} as const;

export type SdkKind = (typeof SdkKind)[keyof typeof SdkKind];

export const SdkPlacement = {
  globalShared: 'global-shared',
  resourceShared: 'resource-shared',
  resourceLocal: 'resource-local',
  operationLocal: 'operation-local',
} as const;

export type SdkPlacement = (typeof SdkPlacement)[keyof typeof SdkPlacement];

export const SdkSource = {
  engine: 'engine',
  user: 'user',
  generated: 'generated',
} as const;

export type SdkSource = (typeof SdkSource)[keyof typeof SdkSource];

export interface SdkInheritanceMeta {
  ref: string;
  fields: string[];
}

export interface SdkExtensionMeta {
  id?: string;
  name?: string;

  group?: string;
  resource?: string;
  domain?: string;
  scope?: SdkScope;

  kind?: SdkKind;
  role?: string;
  placement?: SdkPlacement;

  operation?: string;
  method?: string;
  path?: string;

  property?: string;
  component?: string;
  refId?: string;
  refKind?: string;

  shared?: boolean;
  skip?: boolean;
  generated?: boolean;
  source?: SdkSource;

  inherits?: SdkInheritanceMeta;
}
