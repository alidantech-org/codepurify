/**
 * CORE SCHEMA ENUMS
 * Defines the semantic structure of your platform
 */

export enum ECoreTable {
  TaxonomyNodes = 'taxonomy_nodes',
  TaxonomyRelations = 'taxonomy_relations',
  Aliases = 'aliases',
  AliasTaxonomyNodes = 'alias_taxonomy_nodes',
  Capabilities = 'capabilities',
  FulfillmentModes = 'fulfillment_modes',
  PricingModels = 'pricing_models',
}

/**
 * Whether a node is a grouping or an actual selectable item
 */
export enum ETaxonomyKind {
  Category = 'category',
  Entity = 'entity',
}

/**
 * Domain the node belongs to
 */
export enum ETaxonomyType {
  Business = 'business',
  Product = 'product',
  Service = 'service',
}

/**
 * Type of alias captured
 */
export enum EAliasType {
  Formal = 'formal',
  Common = 'common',
  Slang = 'slang',
  Phrase = 'phrase',
  Misspelling = 'misspelling',
}

/**
 * Relationships between taxonomy nodes
 */
export enum ETaxonomyRelationType {
  BusinessHasProduct = 'business_has_product',
  BusinessHasService = 'business_has_service',

  ProductBelongsToCategory = 'product_belongs_to_category',
  ServiceBelongsToCategory = 'service_belongs_to_category',

  RelatedProduct = 'related_product',
  RelatedService = 'related_service',
}

/**
 * Platform capabilities (frontend features enabled)
 */
export enum ECapabilityCode {
  Ecommerce = 'ecommerce',
  ServiceBooking = 'service_booking',
  ProductServicing = 'product_servicing',
  ActivityBooking = 'activity_booking',
  Subscription = 'subscription',
  Entertainment = 'entertainment',
  Reservation = 'reservation',
  TicketedEntry = 'ticketed_entry',
  RequestVisit = 'request_visit',
  QuoteRequest = 'quote_request',
}

/**
 * How a service/product is fulfilled
 */
export enum EFulfillmentModeCode {
  AtBusinessPlace = 'at_business_place',
  AtCustomerPlace = 'at_customer_place',
  DropOff = 'drop_off',
  PickupAndReturn = 'pickup_and_return',
  Delivery = 'delivery',
}

/**
 * Pricing strategies supported
 */
export enum EPricingModelCode {
  FixedPrice = 'fixed_price',
  StartingFromPrice = 'starting_from_price',
  CustomQuote = 'custom_quote',

  TaskBased = 'task_based',
  ItemServicedBased = 'item_serviced_based',
  ServiceQuantityBased = 'service_quantity_based',

  EstimateAndOverride = 'estimate_and_override',
  TimeBased = 'time_based',
}
