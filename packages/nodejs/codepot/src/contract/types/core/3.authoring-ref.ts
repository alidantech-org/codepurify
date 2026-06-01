// src/contract/types/core/3.authoring-ref.ts

import type { PrimitiveDefinition } from '@/contract/types/compiled/properties/primitive/definition';
import type { EnumDefinition } from '@/contract/types/compiled/properties/enum/definition';
import type { CompositeDefinition } from '@/contract/types/compiled/properties/composite/definition';
import type { RefProperty } from '@/contract/types/compiled/properties/definition';

import type { EntityDefinition } from '@/contract/types/compiled/schema/entity/definition';
import type { EntityField } from '@/contract/types/compiled/schema/entity/field/definition';
import type { ModelDefinition } from '@/contract/types/compiled/schema/model/definition';
import type { DtoDefinition } from '@/contract/types/compiled/schema/dto/definition';
import type { ParamsDefinition } from '@/contract/types/compiled/schema/params/definition';

import type { ResourceDefinition } from '@/contract/types/compiled/resource/definition';
import type { OperationDefinition } from '@/contract/types/compiled/resource/operation/definition';
import type { RoutePathDefinition } from '@/contract/types/compiled/resource/route/definition';

import type { ErrorDefinition } from '@/contract/types/compiled/response/errors/definition';

import type {
  SecurityCredentialDefinition,
  SecurityPolicyDefinition,
  SecurityPrincipalDefinition,
} from '@/contract/types/compiled/security/definition';

import type { DefinitionItem } from '@/contract/types/compiled/definition';

// ============================================================================
// AUTHORING REF KIND
// ============================================================================

export const AuthoringRefKind = {
  propertyPrimitive: 'property.primitive',
  propertyEnum: 'property.enum',
  propertyComposite: 'property.composite',

  schemaEntity: 'schema.entity',
  schemaEntityField: 'schema.entity.field',
  schemaEntityFieldSet: 'schema.entity.field_set',
  schemaModel: 'schema.model',
  schemaDto: 'schema.dto',
  schemaParams: 'schema.params',

  resource: 'resource',
  resourceOperation: 'resource.operation',
  resourceRoute: 'resource.route',

  error: 'error',

  securityCredential: 'security.credential',
  securityPrincipal: 'security.principal',
  securityPolicy: 'security.policy',
} as const;

export type AuthoringRefKind = (typeof AuthoringRefKind)[keyof typeof AuthoringRefKind];

// ============================================================================
// ARRAY / USAGE
// ============================================================================

export interface ArrayUsageOptions extends DefinitionItem {
  readonly minItems?: number;
  readonly maxItems?: number;
  readonly uniqueItems?: boolean;
}

export interface RefUsageOptions<TExtension = never> extends DefinitionItem {
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly array?: true | ArrayUsageOptions | false;
  readonly extendWith?: TExtension;
}

// ============================================================================
// AUTHORING REF BASE
// ============================================================================

export interface AuthoringRefBase<TTarget, TKind extends AuthoringRefKind> {
  /**
   * Runtime/compiler ID.
   * This is not a final JSON/YAML $ref.
   */
  readonly id: string;

  readonly kind: TKind;

  readonly key: string;

  /**
   * Type-only marker.
   */
  readonly __target?: TTarget;
}

// ============================================================================
// USAGE METHODS
// ============================================================================

export interface RefUsage<TTarget, TKind extends AuthoringRefKind, TExtension = never> {
  readonly ref: AuthoringRef<TTarget, TKind, TExtension>;
  readonly usage: RefUsageOptions<TExtension>;

  optional(): RefUsage<TTarget, TKind, TExtension>;
  required(): RefUsage<TTarget, TKind, TExtension>;

  nullable(): RefUsage<TTarget, TKind, TExtension>;
  nonNullable(): RefUsage<TTarget, TKind, TExtension>;

  array(options?: true | ArrayUsageOptions): RefUsage<TTarget, TKind, TExtension>;
  single(): RefUsage<TTarget, TKind, TExtension>;
}

export interface ExtendableRefUsage<TTarget, TKind extends AuthoringRefKind, TExtension> extends RefUsage<TTarget, TKind, TExtension> {
  extendWith(fields: TExtension): ExtendableRefUsage<TTarget, TKind, TExtension>;
}

export type AuthoringRef<TTarget, TKind extends AuthoringRefKind, TExtension = never> = AuthoringRefBase<TTarget, TKind> & {
  optional(): RefUsage<TTarget, TKind, TExtension>;
  required(): RefUsage<TTarget, TKind, TExtension>;

  nullable(): RefUsage<TTarget, TKind, TExtension>;
  nonNullable(): RefUsage<TTarget, TKind, TExtension>;

  array(options?: true | ArrayUsageOptions): RefUsage<TTarget, TKind, TExtension>;
  single(): RefUsage<TTarget, TKind, TExtension>;
};

export type ExtendableAuthoringRef<TTarget, TKind extends AuthoringRefKind, TExtension> = AuthoringRefBase<TTarget, TKind> & {
  optional(): ExtendableRefUsage<TTarget, TKind, TExtension>;
  required(): ExtendableRefUsage<TTarget, TKind, TExtension>;

  nullable(): ExtendableRefUsage<TTarget, TKind, TExtension>;
  nonNullable(): ExtendableRefUsage<TTarget, TKind, TExtension>;

  array(options?: true | ArrayUsageOptions): ExtendableRefUsage<TTarget, TKind, TExtension>;
  single(): ExtendableRefUsage<TTarget, TKind, TExtension>;

  extendWith(fields: TExtension): ExtendableRefUsage<TTarget, TKind, TExtension>;
};

// ============================================================================
// USAGE TYPE HELPERS
// ============================================================================

export type UsageOf<TRef> = TRef extends unknown
  ? TRef extends ExtendableAuthoringRef<infer TTarget, infer TKind, infer TExtension>
    ? ExtendableRefUsage<TTarget, TKind, TExtension>
    : TRef extends AuthoringRef<infer TTarget, infer TKind, infer TExtension>
      ? RefUsage<TTarget, TKind, TExtension>
      : never
  : never;

export type MaybeUsage<TRef> = TRef | UsageOf<TRef>;

// ============================================================================
// PROPERTY REFS
// ============================================================================

export type PrimitiveAuthoringRef = AuthoringRef<PrimitiveDefinition, typeof AuthoringRefKind.propertyPrimitive>;

export type EnumAuthoringRef = AuthoringRef<EnumDefinition, typeof AuthoringRefKind.propertyEnum>;

export type CompositeAuthoringRef = AuthoringRef<CompositeDefinition, typeof AuthoringRefKind.propertyComposite>;

export type PropertyAuthoringRef = PrimitiveAuthoringRef | EnumAuthoringRef | CompositeAuthoringRef;

export type PropertyRefTarget = RefProperty;

// ============================================================================
// SCHEMA REFS
// ============================================================================

export type EntityAuthoringRef = AuthoringRef<EntityDefinition, typeof AuthoringRefKind.schemaEntity>;

export type EntityFieldAuthoringRef = AuthoringRef<EntityField, typeof AuthoringRefKind.schemaEntityField>;

// TODO: Add EntityFieldSetDefinition to schema types and use it here.
export type EntityFieldSetAuthoringRef = AuthoringRef<ModelDefinition, typeof AuthoringRefKind.schemaEntityFieldSet>;

export type ModelAuthoringRef<TExtension = unknown> = ExtendableAuthoringRef<
  ModelDefinition,
  typeof AuthoringRefKind.schemaModel,
  TExtension
>;

export type DtoAuthoringRef<TExtension = unknown> = ExtendableAuthoringRef<DtoDefinition, typeof AuthoringRefKind.schemaDto, TExtension>;

export type ParamsAuthoringRef = AuthoringRef<ParamsDefinition, typeof AuthoringRefKind.schemaParams>;

export type SchemaAuthoringRef = EntityAuthoringRef | ModelAuthoringRef | DtoAuthoringRef | ParamsAuthoringRef;

// ============================================================================
// RESOURCE REFS
// ============================================================================

export type ResourceAuthoringRef = AuthoringRef<ResourceDefinition, typeof AuthoringRefKind.resource>;

export type OperationAuthoringRef = AuthoringRef<OperationDefinition, typeof AuthoringRefKind.resourceOperation>;

export type RouteAuthoringRef = AuthoringRef<RoutePathDefinition, typeof AuthoringRefKind.resourceRoute>;

// ============================================================================
// ERROR REFS
// ============================================================================

export type ErrorAuthoringRef = AuthoringRef<ErrorDefinition, typeof AuthoringRefKind.error>;

// ============================================================================
// SECURITY REFS
// ============================================================================

export type SecurityCredentialAuthoringRef<TTarget = SecurityCredentialDefinition> = AuthoringRef<
  TTarget,
  typeof AuthoringRefKind.securityCredential
>;

export type SecurityPrincipalAuthoringRef<TTarget = SecurityPrincipalDefinition> = AuthoringRef<
  TTarget,
  typeof AuthoringRefKind.securityPrincipal
>;

export type SecurityPolicyAuthoringRef<TTarget = SecurityPolicyDefinition> = AuthoringRef<TTarget, typeof AuthoringRefKind.securityPolicy>;
