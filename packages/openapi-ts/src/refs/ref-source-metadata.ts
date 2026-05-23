import type { ComponentRef, EngineRef, ModelRef, PropertyRef } from './ref.types.js';
import type { FieldSourceMetadata, FieldSourceOrigin, ExtendWithInput } from './ref-usage.types.js';
import { RefKind } from './ref-kind.js';
import { isRefUsage } from '../validation/ref-usage-guards.js';

export function getSourceMetadataFromRef(ref: EngineRef, origin: FieldSourceOrigin): FieldSourceMetadata {
  if (ref.kind === RefKind.component) {
    const componentRef = ref as ComponentRef;
    return {
      origin,
      sourceRefId: componentRef.id,
      sourceSchemaName: componentRef.name,
      sourceResource: componentRef.meta?.resource,
      sourceGroup: componentRef.meta?.group,
      shared: componentRef.meta?.resource === 'shared' || componentRef.meta?.group === 'shared',
    };
  }

  if (ref.kind === RefKind.model) {
    const modelRef = ref as ModelRef;
    return {
      origin,
      sourceRefId: modelRef.id,
      sourceSchemaName: modelRef.name,
      sourceResource: modelRef.meta?.resource,
      sourceGroup: modelRef.meta?.group,
      shared: modelRef.meta?.resource === 'shared' || modelRef.meta?.group === 'shared',
    };
  }

  if (ref.kind === RefKind.property) {
    const propertyRef = ref as PropertyRef;
    return {
      origin,
      propertyRefId: propertyRef.id,
      fieldKey: propertyRef.propertyKey,
      propertyResource: propertyRef.meta?.resource,
      shared: propertyRef.meta?.resource === 'shared' || propertyRef.meta?.group === 'shared',
    };
  }

  return { origin };
}

export function getSourceMetadataFromExtendWithInput(input: ExtendWithInput): FieldSourceMetadata {
  // If it's a RefUsage, check if it has composition metadata
  if (isRefUsage(input)) {
    if (input.usage.composition?.extensions && input.usage.composition.extensions.length > 0) {
      return input.usage.composition.extensions[input.usage.composition.extensions.length - 1];
    }
    // Fallback to ref metadata
    return getSourceMetadataFromRef(input.ref, 'extension');
  }

  // If it's a ModelRef or ComponentRef
  if (typeof input === 'object' && 'kind' in input) {
    return getSourceMetadataFromRef(input as EngineRef, 'extension');
  }

  // Inline field map
  return { origin: 'inline' };
}

export function isSharedRef(ref: EngineRef): boolean {
  if (ref.kind === RefKind.component) {
    const componentRef = ref as ComponentRef;
    return componentRef.meta?.resource === 'shared' || componentRef.meta?.group === 'shared';
  }
  if (ref.kind === RefKind.model) {
    const modelRef = ref as ModelRef;
    return modelRef.meta?.resource === 'shared' || modelRef.meta?.group === 'shared';
  }
  if (ref.kind === RefKind.property) {
    const propertyRef = ref as PropertyRef;
    return propertyRef.meta?.resource === 'shared' || propertyRef.meta?.group === 'shared';
  }
  return false;
}
