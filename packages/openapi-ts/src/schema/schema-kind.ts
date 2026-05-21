export const SchemaKind = {
  primitive: 'primitive',
  composite: 'composite',
  ref: 'ref',
} as const;

export type SchemaKind = (typeof SchemaKind)[keyof typeof SchemaKind];
