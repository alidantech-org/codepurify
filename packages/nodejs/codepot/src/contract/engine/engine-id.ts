export const EngineIdPart = {
  version: 'version',
  resource: 'resource',

  property: 'property',
  primitive: 'primitive',
  enum: 'enum',
  composite: 'composite',

  schema: 'schema',
  entity: 'entity',
  field: 'field',
  fieldSet: 'field_set',
  model: 'model',
  dto: 'dto',
  params: 'params',

  transport: 'transport',
  contentType: 'content_type',
  request: 'request',
  response: 'response',

  security: 'security',
  scheme: 'scheme',
  auth: 'auth',
  roleSource: 'role_source',
  roleSet: 'role_set',
  context: 'context',
  guard: 'guard',

  route: 'route',
  operation: 'operation',
} as const;

export type EngineIdPart = (typeof EngineIdPart)[keyof typeof EngineIdPart];

export function createEngineId(...parts: Array<string | number | undefined>): string {
  return parts
    .filter((part): part is string | number => part !== undefined)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(':');
}
