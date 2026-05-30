import { DefinitionItem } from './definition';

export interface Ref<TTarget> {
  readonly $ref: string;
  readonly __target?: TTarget;
}

export function ref<TTarget>(path: string): Ref<TTarget> {
  return {
    $ref: path,
  } as Ref<TTarget>;
}

export interface ArrayUsageDefinition extends DefinitionItem {
  readonly minItems?: number;
  readonly maxItems?: number;
  readonly uniqueItems?: boolean;
}

export interface RefUsageDefinition<TRef> extends DefinitionItem {
  readonly ref: TRef;

  /**
   * Usage-level array behavior.
   * Definition remains single; usage decides array.
   */
  readonly array?: true | ArrayUsageDefinition;
}
