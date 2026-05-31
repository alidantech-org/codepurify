// src/contract/builders/define-properties.ts

import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { PrimitiveDefinition } from '@/contract/types/properties/primitive/definition';
import type { EnumDefinition } from '@/contract/types/properties/enum/definition';
import type { CompositeDefinition } from '@/contract/types/properties/composite/definition';

import type {
  CompositeAuthoringRef,
  EnumAuthoringRef,
  PrimitiveAuthoringRef,
  PropertyAuthoringRef,
} from '@/contract/types/core/3.authoring-ref';

import type {
  CompositePropertiesResult,
  CompositePropertySourceInput,
  CompositePropertySourceMap,
  EnumPropertiesResult,
  EnumPropertySourceInput,
  EnumPropertySourceMap,
  PrimitivePropertiesResult,
  PrimitivePropertySourceInput,
  PrimitivePropertySourceMap,
  PropertiesBuilder,
  PropertyRefsResult,
  PropertySourceInput,
  PropertySourceInputLike,
  PropertySourceMap,
} from '@/contract/types/core/4.properties-builder';

import { compositeRef, enumRef, primitiveRef, propertyRefFromSource } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefinePropertiesOptions {
  readonly scope: 'version' | 'resource';
  readonly resourceKey?: string;
  readonly state: Partial<PropertiesDefinition>;
}

// ============================================================================
// STATE HELPERS
// ============================================================================

function ensurePropertiesState(state: Partial<PropertiesDefinition>): PropertiesDefinition {
  state.primitives ??= {};
  state.enums ??= {};
  state.composites ??= {};

  return state as PropertiesDefinition;
}

function isPropertySourceBuilder(value: PropertySourceInputLike): value is { readonly input: PropertySourceInput } {
  return !!value && typeof value === 'object' && 'input' in value;
}

function toPropertySourceInput(value: PropertySourceInputLike): PropertySourceInput {
  return isPropertySourceBuilder(value) ? value.input : value;
}

function normalizePropertySources<TFields extends PropertySourceMap>(fields: TFields): Record<keyof TFields & string, PropertySourceInput> {
  const normalized = {} as Record<keyof TFields & string, PropertySourceInput>;

  for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
    normalized[key] = toPropertySourceInput(value);
  }

  return normalized;
}

function writePrimitiveSource(state: PropertiesDefinition, key: string, source: PrimitivePropertySourceInput): void {
  state.primitives[key] = source as unknown as PrimitiveDefinition;
}

function writeEnumSource(state: PropertiesDefinition, key: string, source: EnumPropertySourceInput): void {
  state.enums[key] = source as unknown as EnumDefinition;
}

function writeCompositeSource(state: PropertiesDefinition, key: string, source: CompositePropertySourceInput): void {
  state.composites[key] = source as unknown as CompositeDefinition;
}

function writePropertySource(state: PropertiesDefinition, key: string, source: PropertySourceInput): void {
  if (source.kind === 'primitive') {
    writePrimitiveSource(state, key, source);
    return;
  }

  if (source.kind === 'enum') {
    writeEnumSource(state, key, source);
    return;
  }

  if (source.kind === 'composite') {
    writeCompositeSource(state, key, source);
  }
}

function writePropertySources<TFields extends PropertySourceMap>(
  state: PropertiesDefinition,
  fields: TFields,
): Record<keyof TFields & string, PropertySourceInput> {
  const normalized = normalizePropertySources(fields);

  for (const [key, source] of Object.entries(normalized) as [keyof TFields & string, PropertySourceInput][]) {
    writePropertySource(state, key, source);
  }

  return normalized;
}

function createPropertyRefs<TFields extends PropertySourceMap>(
  normalizedFields: Record<keyof TFields & string, PropertySourceInput>,
): Record<keyof TFields & string, PropertyAuthoringRef> {
  const refs = {} as Record<keyof TFields & string, PropertyAuthoringRef>;

  for (const [key, value] of Object.entries(normalizedFields) as [keyof TFields & string, PropertySourceInput][]) {
    refs[key] = propertyRefFromSource(key, value);
  }

  return refs;
}

function createPrimitiveRefs<TFields extends PrimitivePropertySourceMap>(fields: TFields): PrimitivePropertiesResult<TFields>['ref'] {
  const refs: Record<string, PrimitiveAuthoringRef> = {};

  for (const key of Object.keys(fields) as Array<keyof TFields & string>) {
    refs[key] = primitiveRef(key);
  }

  return refs as PrimitivePropertiesResult<TFields>['ref'];
}

function createEnumRefs<TFields extends EnumPropertySourceMap>(fields: TFields): EnumPropertiesResult<TFields>['ref'] {
  const refs: Record<string, EnumAuthoringRef> = {};

  for (const key of Object.keys(fields) as Array<keyof TFields & string>) {
    refs[key] = enumRef(key);
  }

  return refs as EnumPropertiesResult<TFields>['ref'];
}

function createCompositeRefs<TFields extends CompositePropertySourceMap>(fields: TFields): CompositePropertiesResult<TFields>['ref'] {
  const refs: Record<string, CompositeAuthoringRef> = {};

  for (const key of Object.keys(fields) as Array<keyof TFields & string>) {
    refs[key] = compositeRef(key);
  }

  return refs as CompositePropertiesResult<TFields>['ref'];
}

function writePropertyGroup<TFields extends PropertySourceMap>(
  state: Partial<PropertiesDefinition>,
  fields: TFields,
): PropertyRefsResult<TFields> {
  const propertiesState = ensurePropertiesState(state);
  const normalizedFields = writePropertySources(propertiesState, fields);

  return {
    fields,
    ref: createPropertyRefs(normalizedFields) as PropertyRefsResult<TFields>['ref'],
  };
}

// ============================================================================
// DEFINE PROPERTIES
// ============================================================================

export function defineProperties(options: DefinePropertiesOptions): PropertiesBuilder {
  const builder: PropertiesBuilder = {
    get state() {
      return options.state;
    },

    primitives<TFields extends PrimitivePropertySourceMap>(fields: TFields): PrimitivePropertiesResult<TFields> {
      writePropertyGroup(options.state, fields);
      return {
        fields,
        ref: createPrimitiveRefs(fields),
      };
    },

    enums<TFields extends EnumPropertySourceMap>(fields: TFields): EnumPropertiesResult<TFields> {
      writePropertyGroup(options.state, fields);
      return {
        fields,
        ref: createEnumRefs(fields),
      };
    },

    composites<TFields extends CompositePropertySourceMap>(fields: TFields): CompositePropertiesResult<TFields> {
      writePropertyGroup(options.state, fields);
      return {
        fields,
        ref: createCompositeRefs(fields),
      };
    },

    refs<TFields extends PropertySourceMap>(fields: TFields): PropertyRefsResult<TFields> {
      return writePropertyGroup(options.state, fields);
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
