/**
 * BUSINESS SCHEMA ENUMS
 */
export enum EBusinessTable {
  Businesses = 'businesses',
  BusinessProducts = 'business_products',
  BusinessServices = 'business_services',
  BusinessCapabilities = 'business_capabilities',
  BusinessFulfillmentModes = 'business_fulfillment_modes',
  BusinessProductPricing = 'business_product_pricing',
  BusinessServicePricing = 'business_service_pricing',
}

/**
 * Business operational status
 */
export enum EBusinessStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

/**
 * Availability indicator (real-time UX)
 */
export enum EAvailabilityStatus {
  Available = 'available',
  Busy = 'busy',
  Closed = 'closed',
}
