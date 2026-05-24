import type { XCodegenDtoRole } from '../sdk/codegen-extension.types.js';
import type { ComponentRef } from '../refs/ref.types.js';
import type { RefUsage } from '../refs/ref-usage.types.js';
import { isComponentRef } from '../validation/ref-guards.js';
import { isRefUsage } from '../validation/ref-usage-guards.js';

/**
 * Records DTO role usage for a given value.
 * Recursively extracts component refs and records their role usage.
 */
export function recordDtoRoleUsage(
  value: unknown,
  role: XCodegenDtoRole,
  usage: Map<string, Set<XCodegenDtoRole>>,
): void {
  if (!value) return;

  // Handle RefUsage - unwrap and record
  if (isRefUsage(value)) {
    recordDtoRoleUsage(value.ref, role, usage);
    recordDtoRoleUsage(value.usage.extendWith, role, usage);
    return;
  }

  // Handle ComponentRef - record role
  if (isComponentRef(value)) {
    let roles = usage.get(value.id);
    if (!roles) {
      roles = new Set();
      usage.set(value.id, roles);
    }
    roles.add(role);
    return;
  }

  // Handle plain objects - recurse
  if (typeof value === 'object' && !Array.isArray(value)) {
    for (const child of Object.values(value)) {
      recordDtoRoleUsage(child, role, usage);
    }
  }

  // Handle arrays - recurse
  if (Array.isArray(value)) {
    for (const item of value) {
      recordDtoRoleUsage(item, role, usage);
    }
  }
}
