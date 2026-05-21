export interface RefResolver {
  readonly schemas: Map<string, string>;
}

export interface OpenApiRef {
  readonly $ref: string;
}
