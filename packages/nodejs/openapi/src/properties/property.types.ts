import type { z } from 'zod';
import type { CodegenMetadata } from '../codegen/codegen-extension.types.js';
import type { PropertyRef } from '../refs/ref.types.js';
import type { RefUsage, RefWithUsageMethods } from '../refs/ref-usage.types.js';
import type { PropertyDefinitionFieldMap } from '../schema/schema.types.js';
import type { PropertyKind } from './property-kind.js';

export type ZodPropertyDefinitionFieldMap = Record<string, z.ZodTypeAny>;

export interface PropertyGroupOptions {
  readonly emitSchema?: boolean;
  readonly abstract?: boolean;
}

export interface PropertyDefinitionBase {
  readonly name: string;
  readonly fields: PropertyDefinitionFieldMap;
  readonly meta?: CodegenMetadata;
  readonly emitSchema?: boolean;
  readonly abstract?: boolean;
}

export interface SharedPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.shared;
}

export interface ForRefPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.forRef;
}

export type PropertyDefinition = SharedPropertyDefinition | ForRefPropertyDefinition;

export type PropertyRefGroup = Record<string, RefWithUsageMethods<PropertyRef> | RefUsage<PropertyRef>>;

export type PropertyFieldRefMap<TFields> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

export type PropertyGroupRegistry<TRefs extends PropertyRefGroup = PropertyRefGroup> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: TRefs;
};

export type PropertyRegistryRef = PropertyRef | PropertyRefGroup;

export interface PropertyRegistry {
  readonly name: string;
  readonly definitions: PropertyDefinition[];
  readonly ref: Record<string, PropertyRegistryRef>;
}
