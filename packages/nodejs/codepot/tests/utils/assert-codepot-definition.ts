import { expect } from 'vitest';
import type { CodepotDefinition } from '@/contract/types/definition';

export function expectValidCodepotDefinition(definition: CodepotDefinition): void {
  expect(definition.codepot).toBeTruthy();
  expect(definition.key).toBeTruthy();
  expect(definition.version).toBeTypeOf('number');

  expect(definition.info.title).toBeTruthy();
  expect(definition.info.version).toBeTruthy();

  expect(definition.properties.primitives).toBeDefined();
  expect(definition.properties.enums).toBeDefined();
  expect(definition.properties.composites).toBeDefined();

  expect(definition.schemas.entities).toBeDefined();
  expect(definition.schemas.models).toBeDefined();
  expect(definition.schemas.dtos).toBeDefined();
  expect(definition.schemas.params).toBeDefined();

  expect(definition.transport.contentTypes).toBeDefined();
  expect(definition.transport.requests).toBeDefined();
  expect(definition.transport.responses).toBeDefined();

  expect(definition.security.schemes).toBeDefined();
  expect(definition.security.auth).toBeDefined();

  expect(definition.resources).toBeDefined();
}
