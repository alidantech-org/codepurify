import { ZodSourceRegistry } from "@/utils/zod/zod-source-registry";

export interface ResourceContext {
  /**
   * Stable machine key.
   * Example: "users", "vehicle_brands"
   */
  readonly key: string;

  /**
   * Human-readable resource name.
   * Example: "User", "Vehicle Brand"
   */
  readonly name: string;

  /**
   * Actual HTTP URL path.
   * Example: "/users", "/auth/sessions"
   */
  readonly route: string;

  /**
   * OpenAPI tag.
   * Defaults to resource name.
   */
  readonly tag: string;

  /**
   * Generated output grouping folders.
   * This is NOT a URL path.
   *
   * Example:
   * ["platform", "auth"]
   * ["references", "vehicles"]
   */
  readonly folders: readonly string[];

  /**
   * Generated resource alias.
   * Defaults to key.
   */
  readonly alias: string;
}

export interface OptionalResourceContext {
  readonly resource?: ResourceContext;
  readonly zodRegistry?: ZodSourceRegistry;
}
