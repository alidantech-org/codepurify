export type Ref<T> = string & { readonly __type: T };

export function ref<T>(path: string): Ref<T> {
  return path as Ref<T>;
}
