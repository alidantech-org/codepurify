// // src/contract/types/core/8.transport-builder.ts

// import type { DefinitionItem } from '@/contract/types/definition';

// import type { TransportDefinition } from '@/contract/types/transport/definition';

// import type { DtoAuthoringRef, MaybeUsage } from './3.authoring-ref';

// // ============================================================================
// // SHARED TRANSPORT INPUTS
// // ============================================================================

// export type TransportSchemaInput = MaybeUsage<DtoAuthoringRef>;

// // ============================================================================
// // CONTENT METADATA
// // ============================================================================

// export interface TransportContentInput extends DefinitionItem {
//   readonly type: string;
// }

// export type TransportContentInputList = TransportContentInput | readonly TransportContentInput[];

// // ============================================================================
// // ERRORS
// // ============================================================================

// export interface TransportErrorInput extends DefinitionItem {
//   readonly status: number;
//   readonly schema: TransportSchemaInput;
//   readonly content?: readonly TransportContentInput[];
//   readonly headers?: Record<string, TransportSchemaInput>;
// }

// export type TransportErrorInputMap = Record<string, TransportErrorInput>;

// export interface TransportErrorsResult<TInput extends TransportErrorInputMap> {
//   readonly errors: TInput;

//   readonly ref: {
//     readonly [K in keyof TInput & string]: TransportErrorAuthoringRef;
//   };
// }

// // ============================================================================
// // CONTENT HELPER
// // ============================================================================

// export interface TransportContentHelper {
//   json(options?: DefinitionItem): TransportContentInput;

//   xml(options?: DefinitionItem): TransportContentInput;

//   yaml(options?: DefinitionItem): TransportContentInput;

//   html(options?: DefinitionItem): TransportContentInput;

//   csv(options?: DefinitionItem): TransportContentInput;

//   text(options?: DefinitionItem): TransportContentInput;

//   binary(options?: DefinitionItem): TransportContentInput;

//   stream(options?: DefinitionItem): TransportContentInput;

//   multipart(options?: DefinitionItem): TransportContentInput;

//   form(options?: DefinitionItem): TransportContentInput;

//   graphql(options?: DefinitionItem): TransportContentInput;

//   protobuf(options?: DefinitionItem): TransportContentInput;

//   msgpack(options?: DefinitionItem): TransportContentInput;

//   type(type: string, options?: DefinitionItem): TransportContentInput;

//   types(...types: TransportContentInput[]): readonly TransportContentInput[];
// }

// // ============================================================================
// // TRANSPORT BUILDER
// // ============================================================================

// export interface TransportBuilder {
//   readonly state: Partial<TransportDefinition>;

//   readonly content: TransportContentHelper;

//   error(
//     status: number,
//     schema: TransportSchemaInput,
//     contentOrOptions?: TransportContentInputList | Omit<TransportErrorInput, 'status' | 'schema'>,
//   ): TransportErrorInput;

//   errors<TInput extends TransportErrorInputMap>(input: TInput): TransportErrorsResult<TInput>;

//   snapshot(): Partial<TransportDefinition>;
// }
