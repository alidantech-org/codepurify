// src/pipeline/compiler/serialization/to-plain-ir.ts

import {
  isAuthoringRef,
  isRefUsage,
  normalizeRefOrUsagePlain,
} from '../refs/normalize-ref-usage';

export function toPlainIr<T>(value: T): T {
  if (isAuthoringRef(value) || isRefUsage(value)) {
    return normalizeRefOrUsagePlain(value) as T;
  }

  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map((item) => toPlainIr(item)) as T;
  }

  const output: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'function') continue;

    const normalized = toPlainIr(child);

    if (normalized !== undefined) {
      output[key] = normalized;
    }
  }

  return output as T;
}
