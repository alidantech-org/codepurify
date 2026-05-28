import type { z } from 'zod';
import { SchemaKind } from './schema-kind';
import type { ComponentRef, ModelRef, PropertyRef } from '../refs/ref.types';
import type { RefUsage } from '../refs/ref-usage.types';
import type { ArrayRef, ExtendedRef } from '../refs/ref-wrapper.types';
import type { SchemaAccess } from './schema-access';
import type { PrimitiveQueryOptions } from './query-behavior';

export interface SchemaBehaviorOptions {
  readonly access?: SchemaAccess;
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly select?: boolean;
  readonly description?: string;
  readonly query?: false | PrimitiveQueryOptions;
}

export interface PrimitiveSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.primitive;
  readonly zod: z.ZodTypeAny;
}

export interface CompositeSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.composite;
  readonly fields: SchemaFieldMap;
}

export interface RefSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.ref;
  readonly ref: PropertyRef | ModelRef | ComponentRef | RefUsage<PropertyRef> | RefUsage<ModelRef> | RefUsage<ComponentRef>;
}

export interface RecordSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.record;
  readonly value: SchemaField;
}

export interface LiteralSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.literal;
  readonly value: string | number | boolean | null;
}

export interface OneOfSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.oneOf;
  readonly values: SchemaField[];
}

export interface AnyOfSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.anyOf;
  readonly values: SchemaField[];
}

export interface FileSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.file;
}

export interface NoContentSchemaField extends SchemaBehaviorOptions {
  readonly kind: typeof SchemaKind.noContent;
}

export type SchemaField =
  | PrimitiveSchemaField
  | CompositeSchemaField
  | RefSchemaField
  | RecordSchemaField
  | LiteralSchemaField
  | OneOfSchemaField
  | AnyOfSchemaField
  | FileSchemaField
  | NoContentSchemaField;

export type SchemaFieldMap = Record<string, SchemaField>;

// Property definition context - used in .shared(), .forRef(), .entity()
// Allows schema helpers like schema.primitive(), schema.ref(), etc.
export type PropertyDefinitionField =
  | PrimitiveSchemaField
  | CompositeSchemaField
  | RefSchemaField
  | RecordSchemaField
  | LiteralSchemaField
  | OneOfSchemaField
  | AnyOfSchemaField
  | FileSchemaField;

export type PropertyDefinitionFieldMap = Record<string, PropertyDefinitionField>;

// Schema composition context - used in defineSchemas(), extendWith()
// Allows direct refs and ref usages (methods added at runtime)
export type SchemaCompositionFieldValue =
  | PropertyRef
  | ModelRef
  | ComponentRef
  | RefUsage<PropertyRef>
  | RefUsage<ModelRef>
  | RefUsage<ComponentRef>
  | ArrayRef<PropertyRef>
  | ArrayRef<ModelRef>
  | ArrayRef<ComponentRef>
  | ExtendedRef<PropertyRef>
  | ExtendedRef<ModelRef>
  | ExtendedRef<ComponentRef>;

export type SchemaCompositionFieldMap = Record<string, SchemaCompositionFieldValue>;
