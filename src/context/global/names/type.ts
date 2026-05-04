import { ArrayChildContext } from '@/context/global/arrays/type';

export type CasingContext = {
  camel: string;
  pascal: string;
  snake: string;
  kebab: string;
  dot: string;
  slash: string;
  path: string;
  constant: string;
  lower: string;
  upper: string;
  title: string;
  train: string;
};

export type NameUnitContext = { casing: CasingContext };

export type NameArraysContext = {
  parts: ArrayChildContext<NameUnitContext>;

  words: ArrayChildContext<NameUnitContext>;

  characters: ArrayChildContext<NameUnitContext>;
};

export type NameVariantContext = {
  casing: CasingContext;

  arrays: NameArraysContext;
};

export type NamesContext = {
  /**
   * Canonical raw source name.
   *
   * This ONLY exists once in the entire names context.
   */
  original: string;

  /**
   * Character length of the original name.
   */
  length: number;

  /**
   * All casing transformations of the original name.
   */
  casing: CasingContext;

  /**
   * Structured iterable arrays derived from the original name.
   */
  arrays: NameArraysContext;

  /**
   * Singular derived name context.
   */
  singular: NameVariantContext;

  /**
   * Plural derived name context.
   */
  plural: NameVariantContext;
};
