import { describe, expect, it } from 'vitest';

import {
  AuthoringRefKind,
  createAuthoringRef,
  createExtendableAuthoringRef,
  refPath,
} from '@/index';

import type { ModelDefinition } from '@/contract/types/schema/model/definition';

describe('authoring refs', () => {
  it('creates normal refs with usage methods', () => {
    const ref = createAuthoringRef({
      path: refPath<ModelDefinition>('#/schemas/models/UserRead'),
      kind: AuthoringRefKind.schemaModel,
      key: 'UserRead',
    });

    const arrayUsage = ref.array({
      minItems: 1,
      uniqueItems: true,
    });

    expect(ref.kind).toBe(AuthoringRefKind.schemaModel);
    expect(arrayUsage.usage.array).toEqual({
      minItems: 1,
      uniqueItems: true,
    });
  });

  it('creates extendable refs with extendWith', () => {
    const ref = createExtendableAuthoringRef<ModelDefinition, typeof AuthoringRefKind.schemaModel, { extra: string }>({
      path: refPath<ModelDefinition>('#/schemas/models/UserRead'),
      kind: AuthoringRefKind.schemaModel,
      key: 'UserRead',
    });

    const extended = ref.extendWith({
      extra: 'value',
    });

    expect(extended.usage.extendWith?.fields).toEqual({
      extra: 'value',
    });
  });
});
