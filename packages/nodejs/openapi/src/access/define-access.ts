import type { AccessDefinition, AccessRegistry } from './access.types.js';

export function defineAccess<const TInput extends Record<string, AccessDefinition>>(input: TInput): AccessRegistry<TInput> {
  const definitions = Object.entries(input).map(([key, definition]) => ({
    key,
    ...definition,
  })) as AccessRegistry<TInput>['definitions'];

  const ref = Object.fromEntries(
    Object.entries(input).map(([key, definition]) => [
      key,
      {
        key,
        name: key,
        definition,
      },
    ]),
  ) as AccessRegistry<TInput>['ref'];

  return {
    definitions,
    ref,
  };
}
