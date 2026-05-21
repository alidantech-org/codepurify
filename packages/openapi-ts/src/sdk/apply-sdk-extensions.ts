import { SdkExtensionKey } from "./sdk-extension.keys";
import type { SdkExtensionMeta } from "./sdk-extension.types.js";

export type SdkExtensionTarget = Record<string, unknown>;

export function applySdkExtensions<T extends SdkExtensionTarget>(
  target: T,
  meta: SdkExtensionMeta,
): T {
  const entries = toSdkExtensionEntries(meta);

  for (const [key, value] of entries) {
    (target as Record<string, unknown>)[key] = value;
  }

  return target;
}

export function toSdkExtensionEntries(
  meta: SdkExtensionMeta,
): Array<[string, unknown]> {
  const entries: Array<[string, unknown]> = [];

  add(entries, SdkExtensionKey.id, meta.id);
  add(entries, SdkExtensionKey.name, meta.name);

  add(entries, SdkExtensionKey.group, meta.group);
  add(entries, SdkExtensionKey.resource, meta.resource);
  add(entries, SdkExtensionKey.domain, meta.domain);
  add(entries, SdkExtensionKey.scope, meta.scope);

  add(entries, SdkExtensionKey.kind, meta.kind);
  add(entries, SdkExtensionKey.role, meta.role);
  add(entries, SdkExtensionKey.placement, meta.placement);

  add(entries, SdkExtensionKey.operation, meta.operation);
  add(entries, SdkExtensionKey.method, meta.method);
  add(entries, SdkExtensionKey.path, meta.path);

  add(entries, SdkExtensionKey.property, meta.property);
  add(entries, SdkExtensionKey.component, meta.component);
  add(entries, SdkExtensionKey.refId, meta.refId);
  add(entries, SdkExtensionKey.refKind, meta.refKind);

  add(entries, SdkExtensionKey.shared, meta.shared);
  add(entries, SdkExtensionKey.skip, meta.skip);
  add(entries, SdkExtensionKey.generated, meta.generated);
  add(entries, SdkExtensionKey.source, meta.source);

  add(entries, SdkExtensionKey.inherits, meta.inherits);

  return entries;
}

function add(
  entries: Array<[string, unknown]>,
  key: string,
  value: unknown,
): void {
  if (value === undefined) return;

  entries.push([key, value]);
}
