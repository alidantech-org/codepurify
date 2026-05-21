export const SDK_EXTENSION_PREFIX = 'x-sdk' as const;

export const SdkExtensionKey = {
  id: 'x-sdk-id',
  name: 'x-sdk-name',

  group: 'x-sdk-group',
  resource: 'x-sdk-resource',
  domain: 'x-sdk-domain',
  scope: 'x-sdk-scope',

  kind: 'x-sdk-kind',
  role: 'x-sdk-role',
  placement: 'x-sdk-placement',

  operation: 'x-sdk-operation',
  method: 'x-sdk-method',
  path: 'x-sdk-path',

  property: 'x-sdk-property',
  component: 'x-sdk-component',
  refId: 'x-sdk-ref-id',
  refKind: 'x-sdk-ref-kind',

  shared: 'x-sdk-shared',
  skip: 'x-sdk-skip',
  generated: 'x-sdk-generated',
  source: 'x-sdk-source',

  inherits: 'x-sdk-inherits',
} as const;

export type SdkExtensionKey = (typeof SdkExtensionKey)[keyof typeof SdkExtensionKey];
