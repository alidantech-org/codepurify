// src/contract/types/compiled/info/definition.ts

import type { DefinitionItem } from '../definition';

// ============================================================================
// CONTACT
// ============================================================================

export interface ContactDefinition extends DefinitionItem {
  readonly name?: string;
  readonly url?: string;
  readonly email?: string;
}

// ============================================================================
// LICENSE
// ============================================================================

export interface LicenseDefinition extends DefinitionItem {
  readonly name: string;

  /**
   * SPDX identifier when available.
   * Example: MIT, Apache-2.0, GPL-3.0-only.
   */
  readonly identifier?: string;

  readonly url?: string;
}

// ============================================================================
// INFO LINKS
// ============================================================================

export interface InfoLinksDefinition {
  readonly website?: string;
  readonly docs?: string;
  readonly support?: string;
  readonly changelog?: string;
  readonly status?: string;
  readonly repository?: string;
}

// ============================================================================
// INFO
// ============================================================================

export interface InfoDefinition extends DefinitionItem {
  readonly title: string;

  /**
   * Public API/product version.
   */
  readonly version: string;

  /**
   * Optional short product/API summary.
   */
  readonly summary?: string;

  readonly terms_of_service?: string;

  readonly contact?: ContactDefinition;

  readonly license?: LicenseDefinition;

  /**
   * Useful product/project links.
   */
  readonly links?: InfoLinksDefinition;
}
