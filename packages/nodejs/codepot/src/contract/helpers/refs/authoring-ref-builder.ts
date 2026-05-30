import {
  AuthoringRefKind,
  type CompositeAuthoringRef,
  type ContentTypeAuthoringRef,
  type DtoAuthoringRef,
  type EntityAuthoringRef,
  type EntityFieldAuthoringRef,
  type EnumAuthoringRef,
  type ModelAuthoringRef,
  type OperationAuthoringRef,
  type ParamsAuthoringRef,
  type PrimitiveAuthoringRef,
  type PropertyAuthoringRef,
  type RequestAuthoringRef,
  type ResourceAuthoringRef,
  type ResponseAuthoringRef,
  type RouteAuthoringRef,
  type SecurityAuthAuthoringRef,
  type SecurityContextAuthoringRef,
  type SecurityGuardAuthoringRef,
  type SecurityRoleSetAuthoringRef,
  type SecurityRoleSourceAuthoringRef,
  type SecuritySchemeAuthoringRef,
} from '@/contract/types/core/3.authoring-ref';

import { ModelCategory } from '@/contract/types/schema/model/definition';

import { createEngineId, EngineIdPart } from '@/contract/engine/engine-id';

import { createAuthoringRef, createExtendableAuthoringRef } from './create-authoring-ref';

import type { PropertySourceInput } from '@/contract/types/core/4.properties-builder';

export function primitiveRef(key: string): PrimitiveAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.property, EngineIdPart.primitive, key),
    kind: AuthoringRefKind.propertyPrimitive,
    key,
    name: key,
  });
}

export function enumRef(key: string): EnumAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.property, EngineIdPart.enum, key),
    kind: AuthoringRefKind.propertyEnum,
    key,
    name: key,
  });
}

export function compositeRef(key: string): CompositeAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.property, EngineIdPart.composite, key),
    kind: AuthoringRefKind.propertyComposite,
    key,
    name: key,
  });
}

export function propertyRefFromSource(key: string, source: PropertySourceInput): PropertyAuthoringRef {
  if (source.kind === 'primitive') return primitiveRef(key);
  if (source.kind === 'enum') return enumRef(key);
  if (source.kind === 'composite') return compositeRef(key);

  return source.ref;
}

export function entityRef(name: string): EntityAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.entity, name),
    kind: AuthoringRefKind.schemaEntity,
    key: name,
    name,
  });
}

export function entityFieldRef(entityName: string, fieldKey: string): EntityFieldAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.entity, entityName, EngineIdPart.field, fieldKey),
    kind: AuthoringRefKind.schemaEntityField,
    key: fieldKey,
    name: fieldKey,
  });
}

export function modelRef(entityName: string, category: ModelCategory): ModelAuthoringRef {
  const key = `${entityName}:${category}`;

  return createExtendableAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.model, entityName, category),
    kind: AuthoringRefKind.schemaModel,
    key,
    name: key,
  }) as ModelAuthoringRef;
}

export function modelRefs(entityName: string) {
  return {
    read: modelRef(entityName, ModelCategory.read),
    create: modelRef(entityName, ModelCategory.create),
    patch: modelRef(entityName, ModelCategory.patch),
    query: modelRef(entityName, ModelCategory.query),
    projection: modelRef(entityName, ModelCategory.projection),
    redacted: modelRef(entityName, ModelCategory.redacted),
    derived: modelRef(entityName, ModelCategory.derived),
    internal: modelRef(entityName, ModelCategory.internal),
  };
}

export function dtoRef(key: string): DtoAuthoringRef {
  return createExtendableAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.dto, key),
    kind: AuthoringRefKind.schemaDto,
    key,
    name: key,
  }) as DtoAuthoringRef;
}

export function paramsRef(key: string): ParamsAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.params, key),
    kind: AuthoringRefKind.schemaParams,
    key,
    name: key,
  });
}

export function resourceRef(key: string): ResourceAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.resource, key),
    kind: AuthoringRefKind.resource,
    key,
    name: key,
  });
}

export function operationRef(resourceKey: string, key: string): OperationAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.resource, resourceKey, EngineIdPart.operation, key),
    kind: AuthoringRefKind.resourceOperation,
    key,
    name: key,
  });
}

export function routeRef(resourceKey: string, key: string): RouteAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.resource, resourceKey, EngineIdPart.route, key),
    kind: AuthoringRefKind.resourceRoute,
    key,
    name: key,
  });
}

export function contentTypeRef(key: string): ContentTypeAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.transport, EngineIdPart.contentType, key),
    kind: AuthoringRefKind.transportContentType,
    key,
    name: key,
  });
}

export function requestRef(key: string): RequestAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.transport, EngineIdPart.request, key),
    kind: AuthoringRefKind.transportRequest,
    key,
    name: key,
  });
}

export function responseRef(key: string): ResponseAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.transport, EngineIdPart.response, key),
    kind: AuthoringRefKind.transportResponse,
    key,
    name: key,
  });
}

export function securitySchemeRef(key: string): SecuritySchemeAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.scheme, key),
    kind: AuthoringRefKind.securityScheme,
    key,
    name: key,
  });
}

export function securityAuthRef(key: string): SecurityAuthAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.auth, key),
    kind: AuthoringRefKind.securityAuth,
    key,
    name: key,
  });
}

export function securityRoleSourceRef(key: string): SecurityRoleSourceAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.roleSource, key),
    kind: AuthoringRefKind.securityRoleSource,
    key,
    name: key,
  });
}

export function securityRoleSetRef(key: string): SecurityRoleSetAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.roleSet, key),
    kind: AuthoringRefKind.securityRoleSet,
    key,
    name: key,
  });
}

export function securityContextRef(key: string): SecurityContextAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.context, key),
    kind: AuthoringRefKind.securityContext,
    key,
    name: key,
  });
}

export function securityGuardRef(key: string): SecurityGuardAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.guard, key),
    kind: AuthoringRefKind.securityGuard,
    key,
    name: key,
  });
}
