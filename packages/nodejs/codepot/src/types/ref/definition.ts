export interface Ref {
  $ref: string;
}

export type PropertyRef =
  | {
      $ref: string; // primitive
    }
  | {
      $ref: string; // enum
    }
  | {
      $ref: string; // composite
    };

export interface SecurityRoleDefinition {
  ref: Ref;
}