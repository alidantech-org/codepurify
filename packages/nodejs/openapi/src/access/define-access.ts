import type { AccessDefinitionInput, AccessOwner, AccessRegistry, NormalizedAccessDefinition } from './access.types.js';

export interface DefineAccessOptions {
  readonly owner: AccessOwner;
}

export function defineAccess<const TInput extends Record<string, AccessDefinitionInput>>(
  input: TInput,
  options: DefineAccessOptions = { owner: { global: true } },
): AccessRegistry<TInput> {
  const definitions = Object.entries(input).map(([key, definition]) => ({
    key,
    owner: options.owner,
    ...normalizeAccessDefinition(definition),
  })) as AccessRegistry<TInput>['definitions'];

  const ref = Object.fromEntries(
    definitions.map((definition) => [
      definition.key,
      {
        key: definition.key,
        name: definition.key,
        owner: options.owner,
        definition,
      },
    ]),
  ) as AccessRegistry<TInput>['ref'];

  return {
    owner: options.owner,
    definitions,
    ref,
  };
}

function normalizeAccessDefinition(definition: AccessDefinitionInput): Omit<NormalizedAccessDefinition, 'key' | 'owner'> {
  if (isAccessDefinitionBuilder(definition)) {
    return definition.build();
  }

  return definition;
}

function isAccessDefinitionBuilder(value: AccessDefinitionInput): value is { build(): Omit<NormalizedAccessDefinition, 'key' | 'owner'> } {
  return typeof (value as { build?: unknown }).build === 'function';
}
