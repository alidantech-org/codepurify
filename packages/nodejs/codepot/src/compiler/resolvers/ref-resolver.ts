// src/compiler/context/ref-resolver.ts

import type { Ref } from '@/contract/types/ir/ref';

export function irRef<TTarget = unknown>(path: string): Ref<TTarget> {
  return { $ref: path };
}

export function propertyPrimitiveRef(key: string): Ref {
  return irRef(`#/properties/primitives/${key}`);
}

export function propertyEnumRef(key: string): Ref {
  return irRef(`#/properties/enums/${key}`);
}

export function propertyCompositeRef(key: string): Ref {
  return irRef(`#/properties/composites/${key}`);
}

export function entityRef(key: string): Ref {
  return irRef(`#/schemas/entities/${key}`);
}

export function entityFieldRef(entityKey: string, fieldKey: string): Ref {
  return irRef(`#/schemas/entities/${entityKey}/fields/${fieldKey}`);
}

export function modelRef(key: string): Ref {
  return irRef(`#/schemas/models/${key}`);
}

export function dtoRef(key: string): Ref {
  return irRef(`#/schemas/dtos/${key}`);
}

export function errorRef(key: string): Ref {
  return irRef(`#/responses/errors/${key}`);
}

export function contentTypeRef(key: string): Ref {
  return irRef(`#/content_types/${key}`);
}
