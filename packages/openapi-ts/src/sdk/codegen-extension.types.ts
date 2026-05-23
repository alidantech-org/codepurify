export type CodegenKind =
  | 'primitive'
  | 'property'
  | 'enum'
  | 'model'
  | 'query'
  | 'dto'
  | 'parameter'
  | 'requestBody'
  | 'response'
  | 'operation';

export interface CodegenMetadata {
  kind?: CodegenKind;
  shared?: true;
  abstract?: true;
  skip?: true;

  resource?: string;
  group?: string;
  entity?: string;
  model?: string;
  property?: string;
  component?: string;
  refId?: string;

  behavior?: string;

  inherits?: readonly string[];

  querySchema?: {
    readonly $ref: string;
  };

  query?: {
    behaviors?: readonly string[];
    sort?: true;
  };
}
