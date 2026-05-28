import type { DeepPartial } from './model-emission-defaults';
import type { QueryModelOptions } from './query-model-defaults';
import { DEFAULT_QUERY_MODEL_OPTIONS } from './query-model-defaults';

export function resolveQueryModelOptions(
  versionInput?: DeepPartial<QueryModelOptions>,
  entityInput?: DeepPartial<QueryModelOptions>,
): QueryModelOptions {
  const base = DEFAULT_QUERY_MODEL_OPTIONS;

  return {
    emitEmptyQueryModels: entityInput?.emitEmptyQueryModels ?? versionInput?.emitEmptyQueryModels ?? base.emitEmptyQueryModels,

    exact: {
      valueMode: base.exact.valueMode,
    },

    exactSearch: {
      valueMode: base.exactSearch.valueMode,
    },

    search: {
      valueMode: entityInput?.search?.valueMode ?? versionInput?.search?.valueMode ?? base.search.valueMode,
    },

    in: {
      valueMode: base.in.valueMode,
    },

    exists: {
      valueMode: entityInput?.exists?.valueMode ?? versionInput?.exists?.valueMode ?? base.exists.valueMode,
    },

    range: {
      mode: base.range.mode,
    },

    sort: {
      mode: entityInput?.sort?.mode ?? versionInput?.sort?.mode ?? base.sort.mode,
      directions: base.sort.directions,
      prefixes: {
        asc: entityInput?.sort?.prefixes?.asc ?? versionInput?.sort?.prefixes?.asc ?? base.sort.prefixes.asc,
        desc: entityInput?.sort?.prefixes?.desc ?? versionInput?.sort?.prefixes?.desc ?? base.sort.prefixes.desc,
      },
      separator: entityInput?.sort?.separator ?? versionInput?.sort?.separator ?? base.sort.separator,
    },
  };
}
