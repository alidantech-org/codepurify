/**
 * PLATFORM SCHEMA ENUMS
 */

/**
 * Platform application types
 */
export enum EAppType {
  Customer = 'customer',
  Vendor = 'vendor',
  Admin = 'admin',
  Internal = 'internal',
  Partner = 'partner',
}

/**
 * Platform application status
 */
export enum EAppStatus {
  Active = 'active',
  Suspended = 'suspended',
  Disabled = 'disabled',
}

/**
 * API key status
 */
export enum EApiKeyStatus {
  Active = 'active',
  Revoked = 'revoked',
  Expired = 'expired',
}

/**
 * Application environment
 */
export enum EAppEnvironment {
  Local = 'local',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

/**
 * Application permission codes
 */
export enum EAppPermissionCode {
  ReadBusinesses = 'read_businesses',
  WriteBusinesses = 'write_businesses',
  ReadTaxonomy = 'read_taxonomy',
  WriteTaxonomy = 'write_taxonomy',
  ReadAnalytics = 'read_analytics',
  WriteAnalytics = 'write_analytics',
  AdminAccess = 'admin_access',
}

/**
 * Platform table names
 */
export enum EPlatformTable {
  Apps = 'apps',
  AppApiKeys = 'app_api_keys',
  AppDomains = 'app_domains',
  AppPermissions = 'app_permissions',
  AppPermissionGrants = 'app_permission_grants',
  AppRequestLogs = 'app_request_logs',
}
