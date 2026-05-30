import { DefinitionItem } from "./definition";

export type Ref<T> = string & { readonly __type: T };

export function ref<T>(path: string): Ref<T> {
  return path as Ref<T>;
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