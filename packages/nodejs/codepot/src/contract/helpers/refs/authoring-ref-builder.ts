import {
  AuthoringRefKind,
  type CompositeAuthoringRef,
  type ContentTypeAuthoringRef,
  type DtoAuthoringRef,
  type EntityAuthoringRef,
  type EntityFieldAuthoringRef,
  type EntityFieldSetAuthoringRef,
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

import {
  EntityFieldSetName,
  type EntityFieldSetRefs,
  EntityModelVariant,
  type EntityModelRefs,
  type PropertySourceInput,
} from '@/contract/types/core/4.properties-builder';

import { createEngineId, EngineIdPart } from '@/contract/engine/engine-id';

import { createAuthoringRef, createExtendableAuthoringRef } from './create-authoring-ref';

// ============================================================================
// PROPERTIES
// ============================================================================

export function primitiveRef(key: string): PrimitiveAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.property, EngineIdPart.primitive, key),
    kind: AuthoringRefKind.propertyPrimitive,
    key,
  });
}

export function enumRef(key: string): EnumAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.property, EngineIdPart.enum, key),
    kind: AuthoringRefKind.propertyEnum,
    key,
  });
}

export function compositeRef(key: string): CompositeAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.property, EngineIdPart.composite, key),
    kind: AuthoringRefKind.propertyComposite,
    key,
  });
}

export function propertyRefFromSource(key: string, source: PropertySourceInput): PropertyAuthoringRef {
  if (source.kind === 'primitive') return primitiveRef(key);
  if (source.kind === 'enum') return enumRef(key);
  if (source.kind === 'composite') return compositeRef(key);

  return source.ref;
}

// ============================================================================
// SCHEMAS
// ============================================================================

export function entityRef(name: string): EntityAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.entity, name),
    kind: AuthoringRefKind.schemaEntity,
    key: name,
  });
}

export function entityFieldRef(entityName: string, fieldKey: string): EntityFieldAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.entity, entityName, EngineIdPart.field, fieldKey),
    kind: AuthoringRefKind.schemaEntityField,
    key: fieldKey,
  });
}

export function modelRef(entityName: string, variant: EntityModelVariant): ModelAuthoringRef {
  const key = `${entityName}:${variant}`;

  return createExtendableAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.model, entityName, variant),
    kind: AuthoringRefKind.schemaModel,
    key,
  }) as ModelAuthoringRef;
}

export function modelRefs(entityName: string): EntityModelRefs {
  return {
    read: modelRef(entityName, EntityModelVariant.read),
    create: modelRef(entityName, EntityModelVariant.create),
    patch: modelRef(entityName, EntityModelVariant.patch),
    query: modelRef(entityName, EntityModelVariant.query),
    public: modelRef(entityName, EntityModelVariant.public),
    publicList: modelRef(entityName, EntityModelVariant.publicList),
    admin: modelRef(entityName, EntityModelVariant.admin),
    internal: modelRef(entityName, EntityModelVariant.internal),
    summary: modelRef(entityName, EntityModelVariant.summary),
    option: modelRef(entityName, EntityModelVariant.option),
    relation: modelRef(entityName, EntityModelVariant.relation),
    projection: modelRef(entityName, EntityModelVariant.projection),
    redacted: modelRef(entityName, EntityModelVariant.redacted),
  };
}

export function entityFieldSetRef(entityName: string, setName: EntityFieldSetName): EntityFieldSetAuthoringRef {
  const key = `${entityName}:${setName}`;

  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.entity, entityName, EngineIdPart.fieldSet, setName),
    kind: AuthoringRefKind.schemaEntityFieldSet,
    key,
  });
}

export function entityFieldSetRefs(entityName: string): EntityFieldSetRefs {
  return {
    all: entityFieldSetRef(entityName, EntityFieldSetName.all),
    scalar: entityFieldSetRef(entityName, EntityFieldSetName.scalar),
    relation: entityFieldSetRef(entityName, EntityFieldSetName.relation),
    readable: entityFieldSetRef(entityName, EntityFieldSetName.readable),
    writable: entityFieldSetRef(entityName, EntityFieldSetName.writable),
    selectable: entityFieldSetRef(entityName, EntityFieldSetName.selectable),
    sortable: entityFieldSetRef(entityName, EntityFieldSetName.sortable),
    filterable: entityFieldSetRef(entityName, EntityFieldSetName.filterable),
    public: entityFieldSetRef(entityName, EntityFieldSetName.public),
    internal: entityFieldSetRef(entityName, EntityFieldSetName.internal),
    secret: entityFieldSetRef(entityName, EntityFieldSetName.secret),
    sensitive: entityFieldSetRef(entityName, EntityFieldSetName.sensitive),
    redacted: entityFieldSetRef(entityName, EntityFieldSetName.redacted),
    persisted: entityFieldSetRef(entityName, EntityFieldSetName.persisted),
    virtual: entityFieldSetRef(entityName, EntityFieldSetName.virtual),
    computed: entityFieldSetRef(entityName, EntityFieldSetName.computed),
    generated: entityFieldSetRef(entityName, EntityFieldSetName.generated),
    immutable: entityFieldSetRef(entityName, EntityFieldSetName.immutable),
    create: entityFieldSetRef(entityName, EntityFieldSetName.create),
    patch: entityFieldSetRef(entityName, EntityFieldSetName.patch),
    read: entityFieldSetRef(entityName, EntityFieldSetName.read),
    list: entityFieldSetRef(entityName, EntityFieldSetName.list),
    summary: entityFieldSetRef(entityName, EntityFieldSetName.summary),
    option: entityFieldSetRef(entityName, EntityFieldSetName.option),
    list_select: entityFieldSetRef(entityName, EntityFieldSetName.listSelect),
    list_sort: entityFieldSetRef(entityName, EntityFieldSetName.listSort),
    list_filter: entityFieldSetRef(entityName, EntityFieldSetName.listFilter),
    public_list_select: entityFieldSetRef(entityName, EntityFieldSetName.publicListSelect),
    public_list_sort: entityFieldSetRef(entityName, EntityFieldSetName.publicListSort),
    public_list_filter: entityFieldSetRef(entityName, EntityFieldSetName.publicListFilter),
    admin_list_select: entityFieldSetRef(entityName, EntityFieldSetName.adminListSelect),
    admin_list_sort: entityFieldSetRef(entityName, EntityFieldSetName.adminListSort),
    admin_list_filter: entityFieldSetRef(entityName, EntityFieldSetName.adminListFilter),
  };
}

export function dtoRef(key: string): DtoAuthoringRef {
  return createExtendableAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.dto, key),
    kind: AuthoringRefKind.schemaDto,
    key,
  }) as DtoAuthoringRef;
}

export function paramsRef(key: string): ParamsAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.schema, EngineIdPart.params, key),
    kind: AuthoringRefKind.schemaParams,
    key,
  });
}

// ============================================================================
// RESOURCES
// ============================================================================

export function resourceRef(key: string): ResourceAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.resource, key),
    kind: AuthoringRefKind.resource,
    key,
  });
}

export function operationRef(resourceKey: string, key: string): OperationAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.resource, resourceKey, EngineIdPart.operation, key),
    kind: AuthoringRefKind.resourceOperation,
    key,
  });
}

export function routeRef(resourceKey: string, key: string): RouteAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.resource, resourceKey, EngineIdPart.route, key),
    kind: AuthoringRefKind.resourceRoute,
    key,
  });
}

// ============================================================================
// TRANSPORT
// ============================================================================

export function contentTypeRef(key: string): ContentTypeAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.transport, EngineIdPart.contentType, key),
    kind: AuthoringRefKind.transportContentType,
    key,
  });
}

export function requestRef(key: string): RequestAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.transport, EngineIdPart.request, key),
    kind: AuthoringRefKind.transportRequest,
    key,
  });
}

export function responseRef(key: string): ResponseAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.transport, EngineIdPart.response, key),
    kind: AuthoringRefKind.transportResponse,
    key,
  });
}

// ============================================================================
// SECURITY
// ============================================================================

export function securitySchemeRef(key: string): SecuritySchemeAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.scheme, key),
    kind: AuthoringRefKind.securityScheme,
    key,
  });
}

export function securityAuthRef(key: string): SecurityAuthAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.auth, key),
    kind: AuthoringRefKind.securityAuth,
    key,
  });
}

export function securityRoleSourceRef(key: string): SecurityRoleSourceAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.roleSource, key),
    kind: AuthoringRefKind.securityRoleSource,
    key,
  });
}

export function securityRoleSetRef(key: string): SecurityRoleSetAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.roleSet, key),
    kind: AuthoringRefKind.securityRoleSet,
    key,
  });
}

export function securityContextRef(key: string): SecurityContextAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.context, key),
    kind: AuthoringRefKind.securityContext,
    key,
  });
}

export function securityGuardRef(key: string): SecurityGuardAuthoringRef {
  return createAuthoringRef({
    id: createEngineId(EngineIdPart.security, EngineIdPart.guard, key),
    kind: AuthoringRefKind.securityGuard,
    key,
  });
}
