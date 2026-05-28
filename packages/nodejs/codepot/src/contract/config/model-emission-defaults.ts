export interface QueryModelEmissionOptions {
  readonly exact: boolean;
  readonly search: boolean;
  readonly exactSearch: boolean;
  readonly range: boolean;
  readonly in: boolean;
  readonly exists: boolean;
  readonly sort: boolean;
  readonly select: boolean;
}

export interface ModelEmissionOptions {
  readonly model: boolean;
  readonly publicModel: boolean;
  readonly privateModel: boolean;
  readonly internalModel: boolean;
  readonly systemModel: boolean;

  readonly partialModel: boolean;
  readonly publicPartialModel: boolean;
  readonly privatePartialModel: boolean;
  readonly internalPartialModel: boolean;
  readonly systemPartialModel: boolean;

  readonly query: QueryModelEmissionOptions;
}

export const DEFAULT_MODEL_EMISSION: ModelEmissionOptions = {
  model: true,
  publicModel: true,
  privateModel: true,
  internalModel: true,
  systemModel: true,

  partialModel: true,
  publicPartialModel: true,
  privatePartialModel: true,
  internalPartialModel: true,
  systemPartialModel: true,

  query: {
    exact: true,
    search: true,
    exactSearch: true,
    range: true,
    in: true,
    exists: true,
    sort: true,
    select: true,
  },
};

export type DeepPartial<T> = {
  readonly [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ModelEmissionInput = DeepPartial<ModelEmissionOptions>;
