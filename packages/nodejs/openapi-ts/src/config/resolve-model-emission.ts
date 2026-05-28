import type { ModelEmissionInput, ModelEmissionOptions } from './model-emission-defaults.js';
import { DEFAULT_MODEL_EMISSION } from './model-emission-defaults.js';

export function resolveModelEmission(versionInput?: ModelEmissionInput, entityInput?: ModelEmissionInput): ModelEmissionOptions {
  const base = DEFAULT_MODEL_EMISSION;

  return {
    model: entityInput?.model ?? versionInput?.model ?? base.model,
    publicModel: entityInput?.publicModel ?? versionInput?.publicModel ?? base.publicModel,
    privateModel: entityInput?.privateModel ?? versionInput?.privateModel ?? base.privateModel,
    internalModel: entityInput?.internalModel ?? versionInput?.internalModel ?? base.internalModel,
    systemModel: entityInput?.systemModel ?? versionInput?.systemModel ?? base.systemModel,

    partialModel: entityInput?.partialModel ?? versionInput?.partialModel ?? base.partialModel,
    publicPartialModel: entityInput?.publicPartialModel ?? versionInput?.publicPartialModel ?? base.publicPartialModel,
    privatePartialModel: entityInput?.privatePartialModel ?? versionInput?.privatePartialModel ?? base.privatePartialModel,
    internalPartialModel: entityInput?.internalPartialModel ?? versionInput?.internalPartialModel ?? base.internalPartialModel,
    systemPartialModel: entityInput?.systemPartialModel ?? versionInput?.systemPartialModel ?? base.systemPartialModel,

    query: {
      exact: entityInput?.query?.exact ?? versionInput?.query?.exact ?? base.query.exact,
      search: entityInput?.query?.search ?? versionInput?.query?.search ?? base.query.search,
      exactSearch: entityInput?.query?.exactSearch ?? versionInput?.query?.exactSearch ?? base.query.exactSearch,
      range: entityInput?.query?.range ?? versionInput?.query?.range ?? base.query.range,
      in: entityInput?.query?.in ?? versionInput?.query?.in ?? base.query.in,
      exists: entityInput?.query?.exists ?? versionInput?.query?.exists ?? base.query.exists,
      sort: entityInput?.query?.sort ?? versionInput?.query?.sort ?? base.query.sort,
      select: entityInput?.query?.select ?? versionInput?.query?.select ?? base.query.select,
    },
  };
}
