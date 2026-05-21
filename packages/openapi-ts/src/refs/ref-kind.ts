export const RefKind = {
  property: 'property',
  component: 'component',
  model: 'model',
  route: 'route',
  operation: 'operation',
} as const;

export type RefKind = (typeof RefKind)[keyof typeof RefKind];
