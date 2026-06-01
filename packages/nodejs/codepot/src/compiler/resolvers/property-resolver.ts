// src/compiler/resolvers/property-resolver.ts

import type { Ref } from '@/contract/types/ir/ref';

import { propertyCompositeRef, propertyEnumRef, propertyPrimitiveRef } from './ref-resolver';
import { toSnakeCaseKey, toKebabCase } from '../../utils/naming/normalize-key';

export type CompiledPropertyKind = 'primitive' | 'enum' | 'composite';

export interface PromotedProperty {
  readonly kind: CompiledPropertyKind;
  readonly key: string;
  readonly value: Record<string, unknown>;
  readonly ref: Ref;
}

export function compilePrimitiveProperty(source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: source.type,
  };

  if (source.description) result.description = source.description;
  if (source.deprecated !== undefined) result.deprecated = source.deprecated;
  if (source.meta) result.meta = source.meta;
  if (source.format) result.format = toKebabCase(String(source.format));
  if (source.validation) {
    result.validation = normalizeValidation(source.validation as Record<string, unknown>);
  }
  if (source.example !== undefined) result.example = source.example;

  return result;
}

export function compileEnumProperty(source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {
    values: compileEnumValues(source.values),
  };

  if (source.description) result.description = source.description;
  if (source.deprecated !== undefined) result.deprecated = source.deprecated;
  if (source.meta) result.meta = source.meta;

  return result;
}

export function compileEnumValues(values: unknown): Record<string, unknown>[] {
  if (Array.isArray(values)) {
    return values.map((value) => ({ value }));
  }

  return Object.values(values ?? {}).map((entry: unknown) => {
    if (typeof entry === 'string' || typeof entry === 'number') {
      return { value: entry };
    }

    if (typeof entry !== 'object' || entry === null) {
      return { value: entry };
    }

    const result: Record<string, unknown> = {
      value: (entry as Record<string, unknown>).value,
    };

    const e = entry as Record<string, unknown>;
    if (e.label !== undefined) result.label = e.label;
    if (e.description) result.description = e.description;
    if (e.deprecated !== undefined) result.deprecated = e.deprecated;
    if (e.meta) result.meta = e.meta;

    return result;
  });
}

export function normalizeValidation(validation: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(validation)) {
    out[toSnakeCaseKey(key)] = value;
  }

  return out;
}

export function resolvePropertyRef(ref: Record<string, unknown>): Ref {
  const id = ref?.id as string | undefined;

  if (!id) {
    throw new Error('Missing property ref id.');
  }

  const parts = id.split(':');

  if (parts[0] !== 'property') {
    throw new Error(`Expected property ref, got "${id}".`);
  }

  const kind = parts[1];
  const key = toSnakeCaseKey(parts[2]);

  if (kind === 'primitive') return propertyPrimitiveRef(key);
  if (kind === 'enum') return propertyEnumRef(key);
  if (kind === 'composite') return propertyCompositeRef(key);

  throw new Error(`Unsupported property ref kind "${kind}" in "${id}".`);
}

export function promoteInlineProperty(source: Record<string, unknown>, fallbackKey: string): PromotedProperty {
  const kind = source?.kind as string | undefined;

  if (kind === 'primitive') {
    const key = toSnakeCaseKey(fallbackKey);

    return {
      kind,
      key,
      value: compilePrimitiveProperty(source),
      ref: propertyPrimitiveRef(key),
    };
  }

  if (kind === 'enum') {
    const key = toSnakeCaseKey(fallbackKey);

    return {
      kind,
      key,
      value: compileEnumProperty(source),
      ref: propertyEnumRef(key),
    };
  }

  throw new Error(`Inline property kind "${kind}" is not supported yet.`);
}
