// src/compiler/passes/01-properties.ts

import type { Ref } from '@/contract/types/ir/ref';
import type { PrimitiveDefinition } from '@/contract/types/ir/properties/primitive/definition';
import type { EnumDefinition } from '@/contract/types/ir/properties/enum/definition';
import type { CompositeDefinition } from '@/contract/types/ir/properties/composite/definition';
import type { CompilerContext } from '../context/compiler-context';
import {
  compileEnumProperty,
  compilePrimitiveProperty,
  promoteInlineProperty,
  resolvePropertyRef,
  type PromotedProperty,
} from '../resolvers/property-resolver';
import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

function registerPromotedProperty(ctx: CompilerContext, promoted: PromotedProperty): void {
  if (promoted.kind === 'primitive') {
    ctx.ir.properties.primitives[promoted.key] = promoted.value as unknown as PrimitiveDefinition;
    return;
  }

  if (promoted.kind === 'enum') {
    ctx.ir.properties.enums[promoted.key] = promoted.value as unknown as EnumDefinition;
    return;
  }

  if (promoted.kind === 'composite') {
    ctx.ir.properties.composites[promoted.key] = promoted.value as unknown as CompositeDefinition;
  }
}

function compileCompositeMember(ctx: CompilerContext, compositeKey: string, memberKey: string, value: unknown): Ref {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Invalid composite member value for "${compositeKey}.${memberKey}".`);
  }

  const v = value as Record<string, unknown>;

  // Debug: log what we received
  // console.log(`Compiling ${compositeKey}.${memberKey}:`, Object.keys(v), v);

  // Direct ref object: { id, kind, key } - check this first
  if (v.id) {
    return resolvePropertyRef(v);
  }

  // PropertySlotRefSource: { mode: 'ref', ref: PropertyAuthoringRef }
  if (v.mode === 'ref' && v.ref) {
    return resolvePropertyRef(v.ref as Record<string, unknown>);
  }

  // PropertyRefMemberInput: { source: { mode: 'ref', ref: {...} } }
  if (v.source && typeof v.source === 'object') {
    const source = v.source as Record<string, unknown>;
    if (source.mode === 'ref' && source.ref) {
      return resolvePropertyRef(source.ref as Record<string, unknown>);
    }
  }

  // PropertySourceBuilder: { input: { kind: 'primitive', ... } }
  if (v.input) {
    const promoted = promoteInlineProperty(v.input as Record<string, unknown>, `${compositeKey}_${memberKey}`);

    registerPromotedProperty(ctx, promoted);

    return promoted.ref;
  }

  // Direct inline property: { kind: 'primitive', ... }
  if (v.kind) {
    const promoted = promoteInlineProperty(v, `${compositeKey}_${memberKey}`);

    registerPromotedProperty(ctx, promoted);

    return promoted.ref;
  }

  throw new Error(`Unable to compile composite member "${compositeKey}.${memberKey}". Keys: ${Object.keys(v).join(', ')}`);
}

function compileComposite(ctx: CompilerContext, key: string, source: Record<string, unknown>): Record<string, unknown> {
  const compiledKey = toSnakeCaseKey(key);
  const properties: Record<string, unknown> = {};

  for (const [memberKey, value] of Object.entries(source.properties ?? {})) {
    properties[toSnakeCaseKey(memberKey)] = compileCompositeMember(ctx, compiledKey, memberKey, value);
  }

  const result: Record<string, unknown> = { properties };

  if (source.description) result.description = source.description;
  if (source.deprecated !== undefined) result.deprecated = source.deprecated;
  if (source.meta) result.meta = source.meta;

  if (source.extends) {
    result.extends = resolvePropertyRef(source.extends as Record<string, unknown>);
  }

  return result;
}

export function compileProperties(ctx: CompilerContext): void {
  const properties = ctx.authoring.properties;

  for (const [key, source] of Object.entries(properties.primitives ?? {})) {
    ctx.ir.properties.primitives[toSnakeCaseKey(key)] = compilePrimitiveProperty(
      source as unknown as Record<string, unknown>,
    ) as unknown as PrimitiveDefinition;
  }

  for (const [key, source] of Object.entries(properties.enums ?? {})) {
    ctx.ir.properties.enums[toSnakeCaseKey(key)] = compileEnumProperty(
      source as unknown as Record<string, unknown>,
    ) as unknown as EnumDefinition;
  }

  for (const [key, source] of Object.entries(properties.composites ?? {})) {
    ctx.ir.properties.composites[toSnakeCaseKey(key)] = compileComposite(
      ctx,
      key,
      source as unknown as Record<string, unknown>,
    ) as unknown as CompositeDefinition;
  }
}
