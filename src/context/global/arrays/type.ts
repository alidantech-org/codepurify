export type ArrayItemContext<TPayload extends object = object> = {
  index: number;
} & TPayload;

export type ArrayChildContext<TItem extends object = object> = {
  length: number;
  items: ArrayItemContext<TItem>[];
};

export type ArraysContext<TChildren extends Record<string, ArrayChildContext<any>>> = TChildren;
