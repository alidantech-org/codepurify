import type { Ref } from '@/contract/types/ref';

import type { PrimitiveDefinition } from '@/contract/types/properties/primitive/definition';
import type { EnumDefinition } from '@/contract/types/properties/enum/definition';
import type { CompositeDefinition } from '@/contract/types/properties/composite/definition';
import type { RefProperty } from '@/contract/types/properties/definition';

import type { EntityDefinition } from '@/contract/types/schema/entity/definition';
import type { EntityField } from '@/contract/types/schema/entity/field/definition';
import type { ModelDefinition } from '@/contract/types/schema/model/definition';
import type { DtoDefinition } from '@/contract/types/schema/dto/definition';
import type { ParamsDefinition } from '@/contract/types/schema/params/definition';

import type { ResourceDefinition } from '@/contract/types/resource/definition';
import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RoutePathDefinition } from '@/contract/types/resource/route/definition';

import type { ContentTypeDefinition, RequestDefinition, ResponseDefinition } from '@/contract/types/transport/definition';

import type {
  SecurityAuthDefinition,
  SecurityContextDefinition,
  SecurityGuardDefinition,
  SecurityRoleSetDefinition,
  SecurityRoleSourceDefinition,
  SecuritySchemeDefinition,
} from '@/contract/types/security/definition';

import type { DefinitionItem } from '@/contract/types/definition';

// ============================================================================
// AUTHORING REF KIND
// ============================================================================

export const AuthoringRefKind = {
  propertyPrimitive: 'property.primitive',
  propertyEnum: 'property.enum',
  propertyComposite: 'property.composite',

  schemaEntity: 'schema.entity',
  schemaEntityField: 'schema.entity.field',
  schemaModel: 'schema.model',
  schemaDto: 'schema.dto',
  schemaParams: 'schema.params',

  resource: 'resource',
  resourceOperation: 'resource.operation',
  resourceRoute: 'resource.route',

  transportContentType: 'transport.contentType',
  transportRequest: 'transport.request',
  transportResponse: 'transport.response',

  securityScheme: 'security.scheme',
  securityAuth: 'security.auth',
  securityRoleSource: 'security.roleSource',
  securityRoleSet: 'security.roleSet',
  securityContext: 'security.context',
  securityGuard: 'security.guard',
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

export interface ExtendUsageOptions<TExtension> extends DefinitionItem {
  readonly fields: TExtension;
}

export interface RefUsageOptions<TExtension = never> extends DefinitionItem {
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly array?: true | ArrayUsageOptions;
  readonly extendWith?: ExtendUsageOptions<TExtension>;
}

// ============================================================================
// AUTHORING REF BASE
// ============================================================================

export interface AuthoringRefBase<TTarget, TKind extends AuthoringRefKind> {
  /**
   * Stable JSON/YAML IR ref path.
   * Example: "#/schemas/dto/UserPublic"
   */
  readonly path: Ref<TTarget>;

  /**
   * Strong authoring ref kind.
   */
  readonly kind: TKind;

  /**
   * Stable local key.
   */
  readonly key: string;

  readonly name?: string;
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
};

export type ExtendableAuthoringRef<TTarget, TKind extends AuthoringRefKind, TExtension> = AuthoringRefBase<TTarget, TKind> & {
  optional(): ExtendableRefUsage<TTarget, TKind, TExtension>;
  required(): ExtendableRefUsage<TTarget, TKind, TExtension>;

  nullable(): ExtendableRefUsage<TTarget, TKind, TExtension>;
  nonNullable(): ExtendableRefUsage<TTarget, TKind, TExtension>;

  array(options?: true | ArrayUsageOptions): ExtendableRefUsage<TTarget, TKind, TExtension>;

  extendWith(fields: TExtension): ExtendableRefUsage<TTarget, TKind, TExtension>;
};

// ============================================================================
// USAGE TYPE HELPERS
// ============================================================================

export type UsageOf<TRef> = TRef extends unknown
  ? TRef extends AuthoringRef<infer TTarget, infer TKind, infer TExtension>
    ? RefUsage<TTarget, TKind, TExtension>
    : TRef extends ExtendableAuthoringRef<infer TTarget, infer TKind, infer TExtension>
      ? ExtendableRefUsage<TTarget, TKind, TExtension>
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
// TRANSPORT REFS
// ============================================================================

export type ContentTypeAuthoringRef = AuthoringRef<ContentTypeDefinition, typeof AuthoringRefKind.transportContentType>;

export type RequestAuthoringRef = AuthoringRef<RequestDefinition, typeof AuthoringRefKind.transportRequest>;

export type ResponseAuthoringRef = AuthoringRef<ResponseDefinition, typeof AuthoringRefKind.transportResponse>;

// ============================================================================
// SECURITY REFS
// ============================================================================

export type SecuritySchemeAuthoringRef = AuthoringRef<SecuritySchemeDefinition, typeof AuthoringRefKind.securityScheme>;

export type SecurityAuthAuthoringRef = AuthoringRef<SecurityAuthDefinition, typeof AuthoringRefKind.securityAuth>;

export type SecurityRoleSourceAuthoringRef = AuthoringRef<SecurityRoleSourceDefinition, typeof AuthoringRefKind.securityRoleSource>;

export type SecurityRoleSetAuthoringRef = AuthoringRef<SecurityRoleSetDefinition, typeof AuthoringRefKind.securityRoleSet>;

export type SecurityContextAuthoringRef = AuthoringRef<SecurityContextDefinition, typeof AuthoringRefKind.securityContext>;

export type SecurityGuardAuthoringRef = AuthoringRef<SecurityGuardDefinition, typeof AuthoringRefKind.securityGuard>;
