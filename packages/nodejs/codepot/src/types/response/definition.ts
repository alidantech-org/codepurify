import { Ref } from '../ref/definition';

// export interface ResponseDefinition {
//   content: {
//     [contentType: string]: {
//       schema: Ref;
//     };
//   };
// }

export interface ResponseContent {
  schema: Ref;
}

export interface ResponseDefinition {
  description?: string;

  content: Record<string, ResponseContent>;

  metadata?: Record<string, unknown>;
}
